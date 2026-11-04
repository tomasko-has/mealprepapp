import { CogIcon } from "@sanity/icons/Cog";
import { HelpCircleIcon } from "@sanity/icons/HelpCircle";
import { HomeIcon } from "@sanity/icons/Home";
import { InfoOutlineIcon } from "@sanity/icons/InfoOutline";
import type { StructureResolver } from "sanity/structure";

// Left-hand navigation of the Studio. Singletons open their one document directly
// instead of showing a list, so editors can't create a second "Site settings".
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site settings")
        .icon(CogIcon)
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.listItem()
        .title("Pages")
        .child(
          S.list()
            .title("Pages")
            .items([
              S.listItem()
                .title("Home page")
                .icon(HomeIcon)
                .child(S.document().schemaType("homePage").documentId("homePage")),
              S.listItem()
                .title("About page")
                .icon(InfoOutlineIcon)
                .child(S.document().schemaType("aboutPage").documentId("aboutPage")),
              S.listItem()
                .title("How it works page")
                .icon(HelpCircleIcon)
                .child(S.document().schemaType("howItWorksPage").documentId("howItWorksPage")),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem("weekCollection").title("Weekly menus"),
      S.documentTypeListItem("meal").title("Meals"),
      S.documentTypeListItem("addOn").title("Add-ons"),
      S.documentTypeListItem("plan").title("Plans"),
      S.documentTypeListItem("preference").title("Dietary preferences"),
    ]);
