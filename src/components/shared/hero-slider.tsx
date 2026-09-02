"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface SlideButton {
  label: string
  href: string
}

interface Slide {
  tag: string
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
    <section className={className ?? "relative h-[560px] overflow-hidden text-white"}>
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? "auto" : "none" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(160deg, rgba(10,18,41,.88), rgba(10,18,41,.72)), url('${slide.image}')`,
            }}
          />
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
            <span
              className="inline-block text-eyebrow px-4 py-1.5 rounded-full mb-5"
              style={{ backgroundColor: "var(--gold)", color: "var(--navy)" }}
            >
              {slide.tag}
            </span>
            <h1 className="font-heading text-[44px] font-bold text-white mb-[14px] max-w-[720px]">
              {slide.title}
            </h1>
            <p className="max-w-[560px] text-[16px]" style={{ color: "#c7cbe0" }}>
              {slide.subtitle}
            </p>
            <div className="flex gap-4 justify-center flex-wrap mt-8">
              <Link
                href={slide.btn1.href}
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-sm text-nav hover:bg-primary/90 transition-opacity"
              >
                {slide.btn1.label}
              </Link>
              <Link
                href={slide.btn2.href}
                className="inline-flex items-center justify-center bg-transparent border border-white/60 text-white px-6 py-3 rounded-sm text-nav hover:bg-white/10 transition-colors"
              >
                {slide.btn2.label}
              </Link>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => changeSlide(-1)}
        aria-label="Previous slide"
        className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 border border-white/30 text-white text-xl hover:bg-white/30 transition-colors"
      >
        ‹
      </button>
      <button
        onClick={() => changeSlide(1)}
        aria-label="Next slide"
        className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 border border-white/30 text-white text-xl hover:bg-white/30 transition-colors"
      >
        ›
      </button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setActive(i)}
            className="h-2 rounded-full transition-all"
            style={{
              width: i === active ? 24 : 8,
              backgroundColor: i === active ? "var(--gold)" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </section>
  )
}
