"use client";

import { Icon } from "@iconify/react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";

type CardListItem = {
  id: string;
  title: string;
  badge: string;
  image: string | null;
  icon?: string | null;
  count: string | number;
};

const CardList = ({ title, list }: { title: string; list: CardListItem[] }) => {
  return (
    <div>
      <h1 className="mb-6 text-lg font-medium">{title}</h1>

      <div className="flex flex-col gap-2">
        {list.map((item) => (
          <Card
            key={item.id}
            className="flex-row items-center justify-between gap-4 p-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon icon={item.icon || "lucide:sparkles"} className="size-6" />
            </div>

            <CardContent className="flex-1 p-0">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <Badge variant="secondary">{item.badge}</Badge>
            </CardContent>

            <CardFooter className="p-0">{item.count}</CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CardList;