declare interface Response {
  message: string;
  code: number;
  data: { [key: string]: any };
}

declare namespace User {
  interface Info {
    id?: string;
    name?: string | null;
    image?: string | null;
    email?: string | null;
    credits?: number;
    projects?: Video.Info[];
  }
}

declare namespace Video {
  interface New {
    projectName: string;
    videoFile: File | null;
    targetLang: string;
  }
  interface Info {
    id: string;
    title: string;
    status: string;
    thumbnail: string;
    videoURL: string;
  }
  interface detail {
    originalVideo: string;
    translatedVideo: string;
    segments: Segment[];
  }
  interface Segment {
    start: string;
    end: string;
    original: string;
    translated: string;
  }
}
