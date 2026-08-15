"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

interface SlideButton {
  label: string
  href: string
}

interface Slide {
  title: string
  subtitle: string
  image: string
  btn1: SlideButton
  btn2: SlideButton
}

interface HeroSliderProps {
  slides: Slide[]
  intervalMs?: number
  className?: string
}

export function HeroSlider({ slides, intervalMs = 5000, className }: HeroSliderProps) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [slides.length, intervalMs])

  const changeSlide = (dir: number) => {
    setActive((prev) => (prev + dir + slides.length) % slides.length)
  }

  return (
    <section className={className ?? "relative text-white py-32 lg:py-48 overflow-hidden"}>
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? "auto" : "none" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(rgba(10,48,102,0.7), rgba(10,48,102,0.7)), url('${slide.image}')`,
            }}
          />
        </div>
      ))}

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 font-heading">
            {slides[active].title}
          </h1>
          <p className="text-lg sm:text-xl mb-8 text-gray-200">
            {slides[active].subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href={slides[active].btn1.href} className={buttonVariants({ variant: "default", size: "xl" })}>
              {slides[active].btn1.label}
            </Link>
            <Link href={slides[active].btn2.href} className={buttonVariants({ variant: "inverse", size: "xl" })}>
              {slides[active].btn2.label}
            </Link>
          </div>
        </div>
      </div>

      <button
        onClick={() => changeSlide(-1)}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-3 backdrop-blur-sm transition-colors text-white"
      >
        ‹
      </button>
      <button
        onClick={() => changeSlide(1)}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-3 backdrop-blur-sm transition-colors text-white"
      >
        ›
      </button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setActive(i)}
            className="rounded-full transition-all"
            style={{
              width: i === active ? 24 : 8,
              height: 8,
              backgroundColor: i === active ? "#f59e0b" : "rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </div>
    </section>
  )
}
