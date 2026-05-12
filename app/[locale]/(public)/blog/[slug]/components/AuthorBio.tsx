interface AuthorBioProps {
  name: string;
  avatar: string;
  bio: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export default function AuthorBio({ name, avatar, bio, socialLinks }: AuthorBioProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mt-8 border border-gray-200">
      <div className="flex items-start space-x-4">
        <img
          src={avatar}
          alt={name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{name}</h3>
          <p className="text-gray-600 mb-3">{bio}</p>
          {socialLinks && (
            <div className="flex space-x-3">
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} className="text-blue-500 hover:text-blue-600">
                  Twitter
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} className="text-blue-700 hover:text-blue-800">
                  LinkedIn
                </a>
              )}
              {socialLinks.github && (
                <a href={socialLinks.github} className="text-gray-700 hover:text-gray-800">
                  GitHub
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
