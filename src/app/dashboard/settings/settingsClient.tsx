"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import {
  SITE_NAME,
  SLOGAN,
  ADDRESS,
  MAP,
  iframeMAP,
  TEL,
  instagramLink,
  facebookLink,
  LOGO,
  LOGO_BLACK,
  IMAGE_NOT_AVAILABLE,
} from "@/config";
import Image from "next/image";

const SettingsClient = () => {
  const [siteName, setSiteName] = useState(SITE_NAME);
  const [slogan, setSlogan] = useState(SLOGAN);
  const [address, setAddress] = useState(ADDRESS);
  const [map, setMap] = useState(MAP);
  const [iframeMap, setIframeMap] = useState(iframeMAP);
  const [tel, setTel] = useState(TEL);
  const [instagram, setInstagram] = useState(instagramLink);
  const [facebook, setFacebook] = useState(facebookLink);

  const handleSave = () => {
    console.log({
      siteName,
      slogan,
      address,
      map,
      iframeMap,
      tel,
      instagram,
      facebook,
    });

    alert("Beállítások mentve!");
  };

  return (
    <div className="w-full">
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div className="flex flex-col gap-4">
          <label className="font-medium">Név</label>
          <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />

          <label className="font-medium">Slogan</label>
          <Input value={slogan} onChange={(e) => setSlogan(e.target.value)} />

          <label className="font-medium">Telefonszám</label>
          <Input value={tel} onChange={(e) => setTel(e.target.value)} />

          <label className="font-medium">Instagram</label>
          <Input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />

          <label className="font-medium">Facebook</label>
          <Input
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
          />

          <label className="font-medium">Képek</label>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <Image
                src={LOGO_BLACK}
                alt="Logo Black"
                width={80}
                height={80}
                className="rounded bg-white p-2 border"
              />
              <span className="text-xs mt-2">Logó (világos)</span>
            </div>

            <div className="flex flex-col items-center">
              <Image
                src={LOGO}
                alt="Logo White"
                width={80}
                height={80}
                className="rounded bg-black p-2 border"
              />
              <span className="text-xs mt-2">Logó (sötét)</span>
            </div>

            <div className="flex flex-col items-center">
              <Image
                src={IMAGE_NOT_AVAILABLE}
                alt="Image not available"
                width={80}
                height={80}
                className="rounded border"
              />
              <span className="text-xs mt-2">Alapértelmezett kép</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <label className="font-medium">Cím</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />

          <label className="font-medium">Google Maps link</label>
          <Input value={map} onChange={(e) => setMap(e.target.value)} />

          <label className="font-medium">Térkép (iframe)</label>
          <Input
            value={iframeMap}
            onChange={(e) => setIframeMap(e.target.value)}
          />

          <div className="mt-4">
            <label className="font-medium mb-2 block">Térkép előnézet</label>

            <div className="rounded-md overflow-hidden border min-h-[250px] flex items-center justify-center bg-muted">
              {iframeMap &&
              iframeMap.startsWith("https://www.google.com/maps/embed") ? (
                <iframe
                  src={iframeMap}
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Map"
                />
              ) : (
                <span className="text-destructive font-semibold">
                  Hibás link
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 flex justify-end mt-6">
          <Button type="submit">Mentés</Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsClient;