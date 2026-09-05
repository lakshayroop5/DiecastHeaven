'use client'

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import Image from 'next/image'

export interface HeroSlide {
  id: string
  url: string
  type: string
}

const IMAGE_SLIDE_DURATION_MS = 6000

export default function HeroSlides({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0)
  const count = slides.length

  useEffect(() => {
    setActive((i) => Math.min(i, count - 1))
  }, [count])

  const goNext = () => setActive((i) => (i + 1) % count)
  const goPrev = () => setActive((i) => (i - 1 + count) % count)

  const dragStart = useRef<{ x: number; y: number } | null>(null)

  const onPointerDown = (e: ReactPointerEvent) => {
    if (count < 2) return
    dragStart.current = { x: e.clientX, y: e.clientY }
  }

  const onSwipe = (x: number, y: number) => {
    const start = dragStart.current
    dragStart.current = null
    if (!start) return
    const dx = x - start.x
    const dy = y - start.y
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? goNext() : goPrev()
    }
  }

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragStart.current) return
    const dx = e.clientX - dragStart.current.x
    // Horizontal intent detected: commit swipe now, before the browser
    // claims the gesture for vertical scrolling (pointercancel).
    if (Math.abs(dx) > 48) onSwipe(e.clientX, e.clientY)
  }

  const onPointerUp = (e: ReactPointerEvent) => onSwipe(e.clientX, e.clientY)
  const onPointerCancel = (e: ReactPointerEvent) => onSwipe(e.clientX, e.clientY)

  useEffect(() => {
    if (count < 2) return
    const current = slides[active]
    if (!current || current.type === 'VIDEO') return
    const timer = setTimeout(goNext, IMAGE_SLIDE_DURATION_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, count])

  return (
    <div
      className="absolute inset-0 touch-pan-y"
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {/* Slides - crossfade stack */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          {slide.type === 'VIDEO' ? (
            <VideoSlide slide={slide} isActive={i === active} loop={count === 1} onEnded={goNext} />
          ) : (
            <ImageSlide slide={slide} priority={i === 0} />
          )}
        </div>
      ))}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute z-20 right-4 sm:right-8 bottom-20 sm:bottom-28 flex items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show banner ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? 'w-6 bg-hotwheels-yellow' : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ImageSlide({ slide, priority }: { slide: HeroSlide; priority: boolean }) {
  return (
    <>
      <Image
        src={slide.url}
        alt=""
        fill
        sizes="100vw"
        className="object-cover blur-xl opacity-40 scale-105"
        priority={priority}
      />
      <Image
        src={slide.url}
        alt="Diecast car showcase"
        fill
        sizes="100vw"
        className="object-contain sm:object-cover"
        priority={priority}
      />
    </>
  )
}

function VideoSlide({
  slide,
  isActive,
  loop,
  onEnded,
}: {
  slide: HeroSlide
  isActive: boolean
  loop: boolean
  onEnded: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (isActive) {
      el.currentTime = 0
      el.play().catch(() => {})
    } else {
      el.pause()
    }
  }, [isActive])

  return (
    <>
      {/* Blurred backdrop copy fills empty space on tall/narrow screens, mirrors the image design */}
      <video
        src={slide.url}
        muted
        playsInline
        autoPlay
        loop
        preload="auto"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-105"
      />
      <video
        ref={videoRef}
        src={slide.url}
        muted
        playsInline
        autoPlay
        loop={loop}
        onEnded={onEnded}
        preload="auto"
        className="absolute inset-0 w-full h-full object-contain sm:object-cover"
      />
    </>
  )
}
