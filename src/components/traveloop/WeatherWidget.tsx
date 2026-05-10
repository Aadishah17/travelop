"use client";

import { CloudSun, Droplets, Wind } from "lucide-react";

import type { WeatherForecast } from "@/features/traveloop";

import { cn } from "./utils";

export interface WeatherWidgetProps {
  forecast?: WeatherForecast;
  className?: string;
}

export function WeatherWidget({ forecast, className }: WeatherWidgetProps) {
  if (!forecast) {
    return (
      <section className={cn("rounded-lg border border-slate-200 bg-white p-4 shadow-sm", className)} aria-label="Weather">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <CloudSun aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold text-slate-950">Weather</h2>
            <p className="text-sm text-slate-500">Choose a destination to see the forecast.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("rounded-lg border border-slate-200 bg-white p-4 shadow-sm", className)} aria-label={`Weather for ${forecast.destination}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{forecast.destination}</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">{forecast.current?.condition ?? "Forecast"}</h2>
        </div>
        <span className="text-3xl font-semibold text-blue-700">
          {forecast.current ? `${Math.round(forecast.current.temperatureC)}C` : ""}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {forecast.days.slice(0, 4).map((day) => (
          <article key={day.date} className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">{new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(day.date))}</p>
            <p className="mt-2 font-semibold text-slate-950">
              {Math.round(day.highC)} / {Math.round(day.lowC)}C
            </p>
            <p className="mt-1 text-sm text-slate-500">{day.condition}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
              {day.precipitationChance !== undefined ? (
                <span className="inline-flex items-center gap-1">
                  <Droplets aria-hidden="true" className="h-3.5 w-3.5" />
                  {day.precipitationChance}%
                </span>
              ) : null}
              {day.windKph !== undefined ? (
                <span className="inline-flex items-center gap-1">
                  <Wind aria-hidden="true" className="h-3.5 w-3.5" />
                  {day.windKph}
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
