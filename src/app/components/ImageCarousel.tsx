'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  height?: 'h-64' | 'h-96';
}

export default function ImageCarousel({ images, alt, height = 'h-96' }: ImageCarouselProps) {
  return (
    <div className={`w-full ${height} relative carousel-container`}>
      <Swiper
        modules={[Navigation, Pagination, A11y]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          enabled: true,
          prevEl: '.swiper-button-prev',
          nextEl: '.swiper-button-next',
        }}
        pagination={{ 
          clickable: true,
          bulletActiveClass: 'swiper-pagination-bullet-active'
        }}
        loop={true}
        className={`w-full ${height} swiper-container`}
      >
        <div className="swiper-button-prev" slot="button-prev"></div>
        <div className="swiper-button-next" slot="button-next"></div>
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <img
              src={image}
              alt={`${alt} - Image ${index + 1}`}
              className={`w-full ${height} object-cover`}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}