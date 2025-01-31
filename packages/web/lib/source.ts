import { docs, meta } from "@/.source";
import { createMDXSource } from "fumadocs-mdx";
import { loader } from "fumadocs-core/source";
import * as icons from "@heroicons/react/16/solid";
import { createElement } from "react";

export const source = loader({
  baseUrl: "/docs",
  source: createMDXSource(docs, meta),
  icon(icon) {
    if (!icon) {
      return;
    }

    if (!icon.endsWith("Icon")) {
      icon = `${icon}Icon`;
    }

    if (icon && !(icon in icons)) {
      console.log(`Icon not found: ${icon}`);

      return;
    }

    if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
  },
});
