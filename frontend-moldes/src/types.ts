export interface NavItem {
  label: string;
  href: string;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  resultImage: string;
  moldImage: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  content: string;
}

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  excerpt: string;
}