# **App Name**: KnowledgeVerse

## Core Features:

- User Authentication: Implement user authentication with Firebase (email/password, Google login) to secure the knowledge vault.
- Knowledge Entry CRUD: Enable users to create, read, update, and delete knowledge entries with specified data models in Firestore.
- ChromaDB Ingestion: Automatically ingest new or updated knowledge entries into ChromaDB using a Cloud Function, triggered by Firestore document changes.
- Vector Search: Implement a vector search function to find relevant knowledge entries based on user queries using ChromaDB, providing an array of chroma_ids.
- Knowledge Deletion Synchronization: Automatically delete corresponding vector entries in ChromaDB when a knowledge entry is deleted from Firestore using a Cloud Function.
- Content Extraction Tool: If the entry is new and contains a URL, use the provided external API to fetch and extract content such as X posts or Youtube transcripts for more complete context when forming embedding vectors for the user's personal knowledge base. LLM uses extracted information to better assist the user.
- Full-Text Search: Enable fast filtering of the database on the client side based on content such as tags, or substrings of a knowledge entries

## Style Guidelines:

- Background color: Dark charcoal (#222222) for a sleek and professional dark mode experience.
- Primary color: Electric purple (#892EFF) for highlights and interactive elements.
- Accent color: Light teal (#64FFDA) to complement the primary and provide clear visual cues.
- Headline font: 'Space Grotesk' sans-serif for headlines, providing a modern tech feel. Body font: 'Inter' sans-serif for readability in longer texts.
- Use minimalist icons, monochromatic with teal accents for tags and interactive elements.
- Implement a card-based layout for knowledge entries with a clean and intuitive user interface. Make it suitable for infinite scrolling.
- Incorporate subtle animations for creating, updating, and deleting entries to enhance user experience.