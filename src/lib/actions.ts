import {prisma} from "@/lib/prisma";
import { appointmentSchema, formSchema, registerSchema ,appointmentUpdateSchema } from "@/lib/schema";
import {
  sendAppointmentConfirmationEmail,
  sendAppointmentUpdatedEmail,
  sendAppointmentCancelledEmail,
} from "@/lib/email";
import bcrypt from "bcryptjs";
import z from "zod";

const signUp = async (formData: FormData) => {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string | null;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const role = formData.get("role") as string

    if (password !== confirmPassword) {
      return { success: false, error: "Passwords do not match." };
    }

    const validatedData = registerSchema.parse({ name, email, password });

    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email.toLowerCase(),
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Ezzel az email címmel már létezik felhasználó.",
      };
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const defaultAvailability = await prisma.availabilityTemplate.findFirst({
      where: {
        isDefault: true,
      },
      include: {
        days: {
          include: {
            intervals: true,
          },
        },
        overrides: {
          include: {
            intervals: true,
          },
        },
      },
    });

    await prisma.user.create({
      data: {
        name: name.trim(),
        email: validatedData.email.toLowerCase(),
        password: hashedPassword,
        role: {
          connect: { id: role },
        },
        profile: {
          create: {
            phone: phone && phone.trim() !== "" ? phone : null,
            bio: null,
          },
        },
        availability: defaultAvailability
          ? {
              create: {
                days: {
                  create: defaultAvailability.days.map((day) => ({
                    dayOfWeek: day.dayOfWeek,
                    enabled: day.enabled,
                    intervals: {
                      create: day.intervals.map((interval) => ({
                        startTime: interval.startTime,
                        endTime: interval.endTime,
                      })),
                    },
                  })),
                },
                overrides: {
                  create: defaultAvailability.overrides.map((override) => ({
                    date: override.date,
                    disabled: override.disabled,
                    intervals: {
                      create: override.intervals.map((interval) => ({
                        startTime: interval.startTime,
                        endTime: interval.endTime,
                      })),
                    },
                  })),
                },
              },
            }
          : undefined,
      },
    });

    return { success: true, message: "User registered successfully." };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || "An unexpected error occurred during sign-up." };
  }
};



const getUserProfileByEmail = async (email: string) => {
  try {
    const userWithProfile = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        profile: {
          select: {
            phone: true,
            bio: true,
          },
        },
        accounts: {
          select: {
            provider: true,
          },
        },
        role:{
          select:{
            name: true,
            longName: true,
          }
        }
      },
    });

    if (!userWithProfile) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: userWithProfile };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || "Error fetching user profile" };
  }
};


const getUserProfileById = async (id: string) => {
  try {
    const userWithProfile = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        profile: {
          select: {
            phone: true,
            bio: true,
          },
        },
        accounts: {
          select: {
            provider: true,
          }
        },
        role: {
          select:{
            name: true,
            longName: true,
          }
        },
      },
    });

    if (!userWithProfile) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: userWithProfile };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || "Error fetching user profile" };
  }
};


const updateUser = async (userId: string, data: z.infer<typeof formSchema>) => {
  try {
    formSchema.parse(data);

    let roleId: string | undefined;
    if (data.role) {
      const role = await prisma.role.findUnique({ where: { name: data.role.toUpperCase() } });
      if (!role) throw new Error(`Role ${data.role} not found`);
      roleId = role.id;
    }

    const updateData: any = {
      name: data.name,
      email: data.email.toLowerCase(),
      updatedAt: new Date(),
      profile: {
        upsert: {
          create: {
            phone: data.phone || null,
            bio: data.bio || null,
          },
          update: {
            phone: data.phone || null,
            bio: data.bio || null,
          },
        },
      },
      ...(roleId && { roleId })
    };

    if (data.image) {
      updateData.image = data.image;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        updatedAt: true,
        profile: {
          select: {
            phone: true,
            bio: true,
          },
        },
        roleId: true,
      },
    });

    return { success: true, data: updatedUser };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || "Error updating user" };
  }
};


const deleteUser = async (id: string) => {
  try {
    const userWithProfile = await prisma.user.delete({
      where: { id: id },
    });

    if (!userWithProfile) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: userWithProfile };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || "Error fetching user profile" };
  }
};


const createAppointment = async (data: z.infer<typeof appointmentSchema>) => {
  try {
    const validated = appointmentSchema.parse(data);

    const appointmentDate = new Date(validated.dateTime);
    appointmentDate.setSeconds(0, 0);

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        stylistId: validated.stylist_id,
        date: {
          gte: appointmentDate,
          lt: new Date(appointmentDate.getTime() + 60 * 1000),
        },
        status: {
          notIn: ["RESIGNED", "resigned"],
        },
      },
    });

    if (existingAppointment) {
      return {
        success: false,
        error: "Ez az időpont már foglalt.",
      };
    }

    const appointment = await prisma.appointment.create({
      data: {
        customer: {
          create: {
            name: validated.name,
            email: validated.email,
            phone: validated.phone || null,
          },
        },
        stylist: {
          connect: { id: validated.stylist_id },
        },
        date: appointmentDate,
        status: validated.status,
        note: validated.note?.trim() || null,
        services: {
          connect: validated.service_ids.map((id) => ({ id })),
        },
      },
      include: {
        customer: true,
        stylist: true,
        services: {
          include: {
            category: true,
          },
        },
      },
    });

    await sendAppointmentConfirmationEmail({
      customerName: appointment.customer.name,
      customerEmail: appointment.customer.email,
      customerPhone: appointment.customer.phone,
      stylistName: appointment.stylist?.name,
      serviceNames: appointment.services.map((service) => service.name),
      date: appointment.date,
      note: appointment.note,
    });

    return { success: true, data: appointment };
  } catch (error: any) {
    console.error(error);

    return {
      success: false,
      error:
        error.message ||
        "An unexpected error occurred while creating appointment.",
    };
  }
};


const deleteAppointment = async (id: string) => {
  try {
    const appointmentToDelete = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
        stylist: true,
        services: {
          include: { category: true },
        },
      },
    });

    if (!appointmentToDelete) {
      return { success: false, error: "Appointment not found" };
    }

    const appointment = await prisma.appointment.delete({
      where: { id },
    });

    await sendAppointmentCancelledEmail({
      customerName: appointmentToDelete.customer.name,
      customerEmail: appointmentToDelete.customer.email,
      customerPhone: appointmentToDelete.customer.phone,
      stylistName: appointmentToDelete.stylist?.name,
      serviceNames: appointmentToDelete.services.map((service) => service.name),
      date: appointmentToDelete.date,
      note: appointmentToDelete.note,
    });

    return { success: true, data: appointment };
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      error: error.message || "Error fetching appointment data.",
    };
  }
};

const updateAppointment = async (data: z.infer<typeof appointmentUpdateSchema>) => {
  try {
    const validated = appointmentUpdateSchema.parse(data);

    const appointmentDate = new Date(validated.dateTime);
    appointmentDate.setSeconds(0, 0);

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: {
          not: validated.id,
        },
        stylistId: validated.stylist_id,
        date: {
          gte: appointmentDate,
          lt: new Date(appointmentDate.getTime() + 60 * 1000),
        },
        status: {
          notIn: ["RESIGNED", "resigned"],
        },
      },
    });

    if (existingAppointment) {
      return {
        success: false,
        error: "Ez az időpont már foglalt.",
      };
    }

    const appointment = await prisma.appointment.update({
      where: { id: validated.id },
      data: {
        customer: {
          update: {
            name: validated.name,
            email: validated.email,
            phone: validated.phone || null,
          },
        },
        stylist: {
          connect: { id: validated.stylist_id },
        },
        date: appointmentDate,
        status: validated.status,
        note: validated.note?.trim() || null,
        services: {
          set: [],
          connect: validated.service_ids.map((id) => ({ id })),
        },
      },
      include: {
        customer: true,
        stylist: true,
        services: {
          include: { category: true },
        },
      },
    });

    await sendAppointmentUpdatedEmail({
      customerName: appointment.customer.name,
      customerEmail: appointment.customer.email,
      customerPhone: appointment.customer.phone,
      stylistName: appointment.stylist?.name,
      serviceNames: appointment.services.map((service) => service.name),
      date: appointment.date,
      note: appointment.note,
    });

    return { success: true, data: appointment };
  } catch (error: any) {
    console.error("Update Appointment Error:", error);
    return {
      success: false,
      error: error.message || "Failed to update appointment",
    };
  }
};


export { signUp, getUserProfileByEmail, getUserProfileById, updateUser, deleteUser, createAppointment, deleteAppointment, updateAppointment };
