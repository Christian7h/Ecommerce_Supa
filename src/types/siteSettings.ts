export interface HeroSlide {
  image_url: string;
  alt_text: string;
  title: string;
  subtitle: string;
  link: string;
}

export interface FeaturedCategory {
  category: string;
  image_url: string;
  title: string;
}

export interface PromotionBanner {
  image_url: string;
  alt_text: string;
  title: string;
  subtitle: string;
  link: string;
  button_text: string;
}

export interface HomePageSettings {
  hero_images: HeroSlide[];
  featured_categories: FeaturedCategory[];
  promotion_banner: PromotionBanner;
}

// Formularios
export interface HeroSlideFormFields {
  alt_text: string;
  title: string;
  subtitle: string;
  link: string;
}

export interface FeaturedCategoryFormFields {
  category: string;
  title: string;
}

export interface PromotionBannerFormFields {
  banner_alt_text: string;
  banner_title: string;
  banner_subtitle: string;
  banner_link: string;
  banner_button_text: string;
}
