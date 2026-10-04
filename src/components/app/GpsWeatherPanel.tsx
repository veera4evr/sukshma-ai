/**
 * GpsWeatherPanel — card component that:
 * 1. Prompts user to share GPS location
 * 2. Shows live loading state while locating
 * 3. On success: address, nearest panchayat, distance and full weather card
 * 4. On error: friendly message with retry button
 */
import { CloudRain, Droplets, Thermometer, Wind, MapPin, Loader2, LocateFixed, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReliabilityBadge, Metric } from "@/components/app/widgets";
import { useGpsWeather } from "@/hooks/use-gps-weather";
import { cn } from "@/lib/utils";

export function GpsWeatherPanel() {
  const gps = useGpsWeather();

  return (
    <Card className="overflow-hidden">
      {/* Gradient header band */}
      <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 px-6 py-5 text-white">
        {/* Decorative background icon */}
        <MapPin
          className="pointer-events-none absolute -right-4 -top-4 size-32 rotate-12 text-white/10"
          aria-hidden
        />
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-100/80">
              GPS — nearest panchayat
            </p>
            <h2 className="mt-1 font-display text-xl font-bold">
              Weather near you
            </h2>
            <p className="mt-0.5 text-sm text-green-100/75">
              Auto-detect your location for hyper-local weather
            </p>
          </div>
          {(gps.status === "idle" || gps.status === "error") && (
            <Button
              onClick={gps.requestLocation}
              size="lg"
              className="shrink-0 gap-2 bg-white text-emerald-700 hover:bg-green-50 focus-visible:ring-white"
            >
              <LocateFixed className="size-4" />
              Use My Location
            </Button>
          )}
          {(gps.status === "requesting" || gps.status === "locating") && (
            <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm">
              <Loader2 className="size-4 animate-spin" />
              <span>
                {gps.status === "requesting" ? "Requesting access…" : "Locating you…"}
              </span>
            </div>
          )}
          {gps.status === "ready" && (
            <Button
              onClick={gps.requestLocation}
              variant="outline"
              size="sm"
              className="shrink-0 border-white/40 bg-white/15 text-white hover:bg-white/25"
            >
              <LocateFixed className="size-4" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-5 md:p-6">
        {/* ── IDLE ── */}
        {gps.status === "idle" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center text-muted-foreground">
            <div className="grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
              <LocateFixed className="size-7" />
            </div>
            <p className="text-sm">
              Tap <strong className="text-foreground">Use My Location</strong> to find weather for the
              nearest registered panchayat.
            </p>
          </div>
        )}

        {/* ── LOADING ── */}
        {(gps.status === "requesting" || gps.status === "locating") && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            {/* Pulsing pin animation */}
            <div className="relative">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />
              <div className="relative grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50">
                <MapPin className="size-7" />
              </div>
            </div>
            <p className="font-semibold text-foreground">
              {gps.status === "requesting" ? "Waiting for GPS permission…" : "Locating you…"}
            </p>
            <p className="text-sm text-muted-foreground">
              {gps.status === "locating"
                ? "Reverse-geocoding your coordinates and finding the nearest panchayat."
                : "Please allow location access when prompted by your browser."}
            </p>
          </div>
        )}

        {/* ── ERROR ── */}
        {gps.status === "error" && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/40">
              <MapPin className="size-7" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Location unavailable</p>
              <p className="mt-1 text-sm text-muted-foreground">{gps.errorMessage}</p>
            </div>
            <Button onClick={gps.requestLocation} variant="outline" size="sm">
              Try again
            </Button>
          </div>
        )}

        {/* ── READY ── */}
        {gps.status === "ready" && gps.weather && (
          <div className="space-y-5">
            {/* Location summary row */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold text-foreground">{gps.address}</p>
                  <p className="text-sm text-muted-foreground">
                    Nearest panchayat:{" "}
                    <span className="font-semibold text-foreground">{gps.nearestPanchayatName}</span>
                    {gps.distanceKm !== null && (
                      <Badge variant="secondary" className="ml-2 text-[10px]">
                        {gps.distanceKm} km away
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
              <ReliabilityBadge level={gps.weather.level} />
            </div>

            {/* Weather metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Temperature — large display */}
              <div
                className={cn(
                  "col-span-full rounded-xl border px-5 py-4 sm:col-span-2 lg:col-span-1",
                  "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800/30",
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700/70 dark:text-amber-400/70">
                  Temperature
                </p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="tabular font-display text-4xl font-bold text-amber-800 dark:text-amber-300">
                    {gps.weather.tempC.toFixed(0)}°
                  </span>
                  <span className="text-lg text-amber-600 dark:text-amber-400">C</span>
                </div>
                <p className="mt-1 text-sm font-medium text-amber-700 dark:text-amber-400">
                  {gps.weather.condition}
                </p>
                <p className="mt-0.5 text-xs text-amber-600/70 dark:text-amber-500/70">
                  Max today {gps.weather.tempMax.toFixed(0)}°C
                </p>
              </div>

              {/* Other metrics */}
              <div className="col-span-full rounded-xl border border-border bg-muted/20 p-4 sm:col-span-2 lg:col-span-3">
                <div className="grid grid-cols-2 gap-4">
                  <Metric
                    icon={<CloudRain />}
                    tone="sky"
                    label="Rain chance"
                    value={`${gps.weather.rainProb}`}
                    unit="%"
                  />
                  <Metric
                    icon={<Droplets />}
                    tone="teal"
                    label="Humidity"
                    value={gps.weather.humidity.toFixed(0)}
                    unit="%"
                  />
                  <Metric
                    icon={<Wind />}
                    tone="violet"
                    label="Wind"
                    value={gps.weather.windKmh.toFixed(0)}
                    unit="km/h"
                  />
                  <Metric
                    icon={<Thermometer />}
                    tone="amber"
                    label="Rain today"
                    value={gps.weather.rainMm.toFixed(1)}
                    unit="mm"
                  />
                </div>
              </div>
            </div>

            {/* Reliability bar */}
            <div className="flex items-center gap-3 rounded-lg bg-muted/40 px-4 py-2.5">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    gps.weather.reliability >= 0.75
                      ? "bg-emerald-500"
                      : gps.weather.reliability >= 0.58
                        ? "bg-amber-400"
                        : "bg-red-400",
                  )}
                  style={{ width: `${Math.round(gps.weather.reliability * 100)}%` }}
                />
              </div>
              <span className="shrink-0 font-mono text-sm font-semibold text-foreground">
                {Math.round(gps.weather.reliability * 100)}% confidence
              </span>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 rounded-lg border border-blue-200/60 bg-blue-50/60 px-4 py-2.5 dark:border-blue-800/30 dark:bg-blue-950/20">
              <Info className="mt-0.5 size-3.5 shrink-0 text-blue-500" aria-hidden />
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Weather shown is for the nearest registered panchayat (
                <strong>{gps.nearestPanchayatName}</strong>), not your exact GPS point. Demo data only.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
