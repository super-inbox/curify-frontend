import React from 'react';

// Blog Post Standardized Styling Components
// Reusable styling components for consistent blog post appearance

export const BlogSection = ({ children, className = "", size = "default" }: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "default" | "lg";
}) => {
  const sizeClasses = {
    sm: "blog-section-sm",
    default: "blog-section",
    lg: "blog-section-lg"
  };
  
  return (
    <section className={`${sizeClasses[size]} ${className}`}>
      {children}
    </section>
  );
};

export const BlogCard = ({ 
  children, 
  variant = "default", 
  className = "",
  hover = false 
}: {
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "accent" | "purple" | "orange" | "red";
  className?: string;
  hover?: boolean;
}) => {
  const variantClasses = {
    default: "blog-card",
    primary: "blog-card blog-card-primary",
    secondary: "blog-card blog-card-secondary",
    accent: "blog-card blog-card-accent",
    purple: "blog-card blog-card-purple",
    orange: "blog-card blog-card-orange",
    red: "blog-card blog-card-red"
  };
  
  const hoverClass = hover ? "hover:shadow-lg transition-shadow" : "";
  
  return (
    <div className={`${variantClasses[variant]} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};

export const BlogBorderAccent = ({ 
  children, 
  variant = "primary", 
  className = "" 
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent" | "purple" | "orange" | "red";
  className?: string;
}) => {
  const variantClasses = {
    primary: "blog-border-accent blog-border-primary",
    secondary: "blog-border-accent blog-border-secondary",
    accent: "blog-border-accent blog-border-accent",
    purple: "blog-border-accent blog-border-purple",
    orange: "blog-border-accent blog-border-orange",
    red: "blog-border-accent blog-border-red"
  };
  
  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const BlogGrid = ({ 
  children, 
  cols = 2, 
  spacing = "default", 
  className = "" 
}: {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  spacing?: "sm" | "default" | "lg";
  className?: string;
}) => {
  const colsClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  };
  
  const spacingClasses = {
    sm: "blog-grid-sm",
    default: "blog-grid",
    lg: "blog-grid-lg"
  };
  
  return (
    <div className={`grid ${colsClasses[cols]} ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};

export const BlogHeading = ({ 
  level, 
  children, 
  className = "" 
}: {
  level: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}) => {
  const levelClasses = {
    1: "text-4xl font-bold blog-heading-1",
    2: "text-3xl font-semibold blog-heading-2",
    3: "text-2xl font-semibold blog-heading-3",
    4: "text-xl font-semibold"
  };
  
  const Tag = `h${level}` as const;
  
  if (level === 1) {
    return <h1 className={`${levelClasses[level]} ${className}`}>{children}</h1>;
  } else if (level === 2) {
    return <h2 className={`${levelClasses[level]} ${className}`}>{children}</h2>;
  } else if (level === 3) {
    return <h3 className={`${levelClasses[level]} ${className}`}>{children}</h3>;
  } else {
    return <h4 className={`${levelClasses[level]} ${className}`}>{children}</h4>;
  }
};

export const BlogList = ({ 
  children, 
  variant = "default", 
  className = "" 
}: {
  children: React.ReactNode;
  variant?: "default" | "spaced" | "tight";
  className?: string;
}) => {
  const variantClasses = {
    default: "blog-list space-y-2",
    spaced: "blog-list space-y-4",
    tight: "blog-list space-y-1"
  };
  
  return (
    <ul className={`${variantClasses[variant]} ${className}`}>
      {children}
    </ul>
  );
};

export const BlogListItem = ({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <li className={`blog-list-item ${className}`}>
      {children}
    </li>
  );
};

// Color variant mapping for consistent theming
export const ColorVariants = {
  primary: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-800 dark:text-blue-200",
    accent: "border-blue-500"
  },
  secondary: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-800 dark:text-green-200",
    accent: "border-green-500"
  },
  accent: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-800 dark:text-yellow-200",
    accent: "border-yellow-500"
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-800 dark:text-purple-200",
    accent: "border-purple-500"
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-800 dark:text-orange-200",
    accent: "border-orange-500"
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-800 dark:text-red-200",
    accent: "border-red-500"
  }
} as const;

// Utility function for getting consistent color classes
export const getColorClasses = (variant: keyof typeof ColorVariants) => ColorVariants[variant];
