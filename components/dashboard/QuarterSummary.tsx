"use client";

import useSWR from "swr";
import Link from "next/link"; // 👈 1. Import Link
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, TrendingUp, Loader2, ArrowRight } from "lucide-react"; // Import ArrowRight
import { fetcher } from "@/lib/fetcher";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function QuarterSummary() {
  
  const { data: summaryData, isLoading } = useSWR(
    `${API_URL}/dashboard/quarter-summary`, 
    fetcher
  );

  const quarter = summaryData?.quarter || 1;
  const year = summaryData?.year || new Date().getFullYear();
  
  const stats = [
    {
      label: `Q${quarter} Revenue`,
      value: formatRupiah(summaryData?.data?.revenue || 0),
      icon: TrendingUp,
      color: "bg-green-500/20 text-green-400",
      link: "/leads" // 👈 Kita arahkan semua ke leads dulu
    },
    {
      label: "Deals Won",
      value: `${summaryData?.data?.deals || 0} Deals`,
      icon: CheckCircle2,
      color: "bg-blue-500/20 text-blue-400",
      link: "/leads"
    },
    {
      label: "Average Size",
      value: formatRupiah(summaryData?.data?.average || 0),
      icon: FileText,
      color: "bg-orange-500/20 text-orange-400",
      link: "/leads"
    },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="justify-center">
        <CardTitle className="text-lg font-bold text-center">
           Quarter {quarter} Summary {year}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
             <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-900 text-white rounded-lg shadow-md border border-gray-800"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">
                      {item.label}
                    </p>
                    <p className="text-lg font-bold text-white mt-0.5">
                      {item.value}
                    </p>
                  </div>
                </div>

                {/* 👇 2. Implementasi Link ke /leads */}
                <Link href={item.link}>
                    <Button
                      variant="ghost"
                      size="icon" // Pakai size icon biar rapi
                      className="text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                </Link>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}