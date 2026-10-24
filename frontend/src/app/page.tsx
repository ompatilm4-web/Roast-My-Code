"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import RoastStudio from "@/components/RoastStudio";
import HallOfFlame from "@/components/HallOfFlame";
import IntegrationsSection from "@/components/IntegrationsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-zinc-200">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <RoastStudio />
        <HallOfFlame />
        <IntegrationsSection />
      </main>
      <Footer />
    </div>
  );
}
