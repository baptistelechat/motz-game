export interface Attribution {
  text: string;
  url: string;
  title: string;
}

export interface AttributionGroup {
  category: string;
  items: Attribution[];
}

export const ATTRIBUTIONS: AttributionGroup[] = [
  {
    category: "Images",
    items: [
      {
        text: "Animaux icônes créées par Freepik - Flaticon",
        url: "https://www.flaticon.com/fr/packs/animals-126?word=animals",
        title: "Animaux icônes",
      },
    ],
  },
  {
    category: "Sons",
    items: [],
  },
];
