export interface BibleBook {
  abbrev: string;
  name: string; // Matches "name": "Genesis"
  chapters: string[][]; // Array of chapters, each containing verse strings
}

export interface ChunkedDocument {
  id: string;
  text: string;
  metadata: {
    book: string;
    chapter: number;
    source: string;
  };
}
