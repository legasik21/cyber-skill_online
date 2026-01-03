// app/services/campaign-missions/3.0/Campaign3Page.tsx
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Trophy,
  Shield,
  ChevronRight,
  Check,
  ArrowLeft,
  Target,
  Award,
  Calculator,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useOrderSubmit } from "@/hooks/useOrderSubmit"

const TANKS = [
  { id: "windhund", name: "Windhund" },
  { id: "dravec", name: "Dravec" },
  { id: "black-rock", name: "Black Rock" },
];

const MISSION_TYPES = [
  { id: "vanguard", name: "Vanguard" },
  { id: "ambush", name: "Ambush" },
  { id: "assistance", name: "Assistance" },
];

const MISSIONS_PER_TYPE = 15 as const;

// Type for selected missions: { tankId: { missionType: number[] } }
type SelectedMissions = {
  [tankId: string]: {
    [missionType: string]: number[];
  };
};

const orderFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  discordTag: z.string().min(3, { message: "Please enter your Discord tag" }),
  server: z.string().min(1, { message: "Please select a server" }),
  additionalInfo: z.string().optional(),
});

const MISSION_PRICES: Record<string, Record<string, (n: number) => number>> = {
  windhund: {
    vanguard: (n) =>
      n <= 4 ? 4 : n <= 7 ? 3 : n === 8 ? 4 : n === 9 ? 6 : n === 10 ? 4 : n <= 12 ? 5 : n === 13 ? 3 : n === 14 ? 4 : 8,
    ambush: (n) =>
      n === 1 ? 4 : n === 2 ? 6 : n <= 4 ? 4 : n <= 6 ? 3 : n === 7 ? 4 : n === 8 ? 5 : n === 9 ? 6 : n <= 11 ? 5 : n === 12 ? 7 : 6,
    assistance: (n) =>
      n === 1 ? 4 : n === 2 ? 6 : n <= 4 ? 4 : n === 5 ? 3 : n === 6 ? 5 : n === 7 ? 4 : n === 8 ? 5 : n === 9 ? 4 : n === 10 ? 5 : n === 11 ? 6 : n <= 13 ? 4 : n === 14 ? 6 : 8,
  },
  dravec: {
    vanguard: (n) =>
      n === 1 ? 8 : n <= 3 ? 6 : n === 4 ? 5 : n === 5 ? 4 : n === 6 ? 5 : n === 7 ? 6 : n === 8 ? 5 : n === 9 ? 12 : n <= 11 ? 6 : n === 12 ? 7 : n === 13 ? 6 : n === 14 ? 8 : 12,
    ambush: (n) =>
      n === 1 ? 4 : n === 2 ? 7 : n <= 5 ? 6 : n === 6 ? 10 : n === 7 ? 5 : n === 8 ? 9 : n === 9 ? 7 : n === 10 ? 6 : n === 11 ? 8 : n === 12 ? 14 : n === 13 ? 9 : n === 14 ? 8 : 20,
    assistance: (n) =>
      n === 1 ? 10 : n <= 5 ? 6 : n === 6 ? 8 : n === 7 ? 12 : n === 8 ? 8 : n === 9 ? 10 : n <= 14 ? 8 : 12,
  },
  "black-rock": {
    vanguard: (n) =>
      n === 1 ? 12 : n === 2 ? 6 : n === 3 ? 8 : n === 4 ? 6 : n <= 6 ? 7 : n === 7 ? 8 : n <= 10 ? 10 : n === 11 ? 14 : n === 12 ? 15 : n === 13 ? 18 : n === 14 ? 16 : 25,
    ambush: (n) =>
      n <= 2 ? 8 : n === 3 ? 12 : n === 4 ? 10 : n === 5 ? 8 : n <= 7 ? 12 : n === 8 ? 9 : n === 9 ? 12 : n === 10 ? 10 : n === 11 ? 16 : n === 12 ? 13 : n === 13 ? 15 : 22,
    assistance: (n) =>
      n === 1 ? 12 : n === 2 ? 20 : n === 3 ? 6 : n === 4 ? 12 : n === 5 ? 11 : n === 6 ? 12 : n === 7 ? 14 : n === 8 ? 12 : n <= 10 ? 8 : n === 11 ? 7 : n === 12 ? 8 : n === 13 ? 14 : n === 14 ? 10 : 12,
  },
};

// Calculate price for a mission
function getMissionPrice(tankId: string, typeId: string, missionNumber: number): number {
  return MISSION_PRICES[tankId]?.[typeId]?.(missionNumber) ?? 20;
}

export default function Campaign3Page() {
  const { submitOrder, isSubmitting } = useOrderSubmit()
  const [activeTank, setActiveTank] = useState<string>(TANKS[0].id);
  const [selectedMissions, setSelectedMissions] = useState<SelectedMissions>({});

  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      email: "",
      discordTag: "",
      server: "",
      additionalInfo: "",
    },
  });

  const range1to15 = () =>
    Array.from({ length: MISSIONS_PER_TYPE }, (_, i) => i + 1);

  // Toggle mission selection
  const toggleMission = (
    tankId: string,
    missionType: string,
    missionNumber: number
  ) => {
    setSelectedMissions((prev) => {
      const prevTank = prev[tankId] ?? {};
      const prevTypeArr = prevTank[missionType] ?? [];

      const exists = prevTypeArr.includes(missionNumber);
      const nextTypeArr = exists
        ? prevTypeArr.filter((m) => m !== missionNumber)
        : [...prevTypeArr, missionNumber].sort((a, b) => a - b);

      if (nextTypeArr.length === 0) {
        const { [missionType]: _rmType, ...restTypes } = prevTank;
        if (Object.keys(restTypes).length === 0) {
          const { [tankId]: _rmTank, ...rest } = prev;
          return { ...rest };
        }
        return { ...prev, [tankId]: restTypes };
      }

      return {
        ...prev,
        [tankId]: {
          ...prevTank,
          [missionType]: nextTypeArr,
        },
      };
    });
  };

  // Toggle all missions for a specific type (15% discount)
  const selectAllType = (tankId: string, missionType: string) => {
    setSelectedMissions((prev) => {
      const prevTank = prev[tankId] ?? {};
      const isFullySelected =
        (prev[tankId]?.[missionType]?.length ?? 0) === MISSIONS_PER_TYPE;

      if (isFullySelected) {
        const { [missionType]: _rm, ...restTypes } = prevTank;
        if (Object.keys(restTypes).length === 0) {
          const { [tankId]: _rmTank, ...rest } = prev;
          return { ...rest };
        }
        return { ...prev, [tankId]: restTypes };
      }

      return {
        ...prev,
        [tankId]: {
          ...prevTank,
          [missionType]: range1to15(),
        },
      };
    });
  };

  // Toggle all missions for a tank (25% discount)
  const selectAllTank = (tankId: string) => {
    setSelectedMissions((prev) => {
      const isFullySelected = MISSION_TYPES.every(
        (type) => prev[tankId]?.[type.id]?.length === MISSIONS_PER_TYPE
      );

      if (isFullySelected) {
        const { [tankId]: _rm, ...rest } = prev;
        return { ...rest };
      } else {
        const allTypes: Record<string, number[]> = {};
        MISSION_TYPES.forEach((type) => (allTypes[type.id] = range1to15()));
        return { ...prev, [tankId]: allTypes };
      }
    });
  };

  // Check if a mission is selected
  const isMissionSelected = (
    tankId: string,
    missionType: string,
    missionNumber: number
  ): boolean =>
    selectedMissions[tankId]?.[missionType]?.includes(missionNumber) ?? false;

  // Check if all missions of a type are selected
  const isTypeFullSelected = (tankId: string, missionType: string): boolean =>
    selectedMissions[tankId]?.[missionType]?.length === MISSIONS_PER_TYPE;

  // Check if all missions of a tank are selected
  const isTankFullSelected = (tankId: string): boolean => {
    if (!selectedMissions[tankId]) return false;
    return MISSION_TYPES.every(
      (type) => selectedMissions[tankId][type.id]?.length === MISSIONS_PER_TYPE
    );
  };

  // Calculate price details including discounts
  const priceDetails = useMemo(() => {
    let totalPrice = 0;
    let originalPrice = 0;
    let totalDiscount = 0;

    Object.entries(selectedMissions).forEach(([tankId, tankMissions]) => {
      const isFullTank = MISSION_TYPES.every(
        (type) => tankMissions[type.id]?.length === MISSIONS_PER_TYPE
      );

      if (isFullTank) {
        let tankBasePrice = 0;
        MISSION_TYPES.forEach((type) => {
          for (let i = 1; i <= MISSIONS_PER_TYPE; i++)
            tankBasePrice += getMissionPrice(tankId, type.id, i);
        });

        originalPrice += tankBasePrice;
        const discounted = tankBasePrice * 0.75; // 25% off
        totalPrice += discounted;
        totalDiscount += tankBasePrice - discounted;
      } else {
        Object.entries(tankMissions).forEach(([typeId, missions]) => {
          const isFullType = missions.length === MISSIONS_PER_TYPE;
          let typeBasePrice = 0;

          missions.forEach((num) => {
            typeBasePrice += getMissionPrice(tankId, typeId, num);
          });

          originalPrice += typeBasePrice;

          if (isFullType) {
            const discounted = typeBasePrice * 0.85; // 15% off
            totalPrice += discounted;
            totalDiscount += typeBasePrice - discounted;
          } else {
            totalPrice += typeBasePrice;
          }
        });
      }
    });

    return {
      total: Math.round(totalPrice),
      original: Math.round(originalPrice),
      discount: Math.round(totalDiscount),
    };
  }, [selectedMissions]);

  // Count total selected missions
  const totalMissions = useMemo(() => {
    return Object.values(selectedMissions).reduce(
      (acc, tank) =>
        acc + Object.values(tank).reduce((a, m) => a + m.length, 0),
      0
    );
  }, [selectedMissions]);

  // Clear all selections for a tank
  const clearTankSelections = (tankId: string) => {
    setSelectedMissions((prev) => {
      const { [tankId]: _rm, ...rest } = prev;
      return { ...rest };
    });
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedMissions({});
  };

  async function onSubmit(values: z.infer<typeof orderFormSchema>) {
    // Format selected missions for detailed view
    const formattedMissions = Object.entries(selectedMissions)
      .map(([tankId, types]) => {
        const tankName = TANKS.find((t) => t.id === tankId)?.name || tankId;
        const typeDetails = Object.entries(types)
          .map(([typeId, missions]) => {
            const typeName = MISSION_TYPES.find((t) => t.id === typeId)?.name || typeId;
            const sortedMissions = [...missions].sort((a, b) => a - b);
            return `${typeName}: [${sortedMissions.join(", ")}]`;
          })
          .join("; ");
        return `${tankName}: ${typeDetails}`;
      })
      .join("\n");

    await submitOrder({
      email: values.email,
      discordTag: values.discordTag,
      service: 'campaign-missions-3.0',
      message: values.additionalInfo,
      page: 'Campaign Missions 3.0',
      orderDetails: {
          campaign: "3.0",
          missionsSelected: `${totalMissions} missions`,
          missionsDetails: formattedMissions,
          originalPrice: `$${priceDetails.original}`,
          discount: priceDetails.discount > 0 ? `-$${priceDetails.discount}` : 'None',
          totalPrice: `$${priceDetails.total}`,
      },
    })
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <Link
                href="/services/campaign-missions"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Campaigns
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Campaign 3.0
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                Complete Vanguard, Ambush, and Assistance missions for Windhund, Dravec, and Black Rock.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-sm">Any Mission Set</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="text-sm">Extreme Difficulty</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">
                    From $20
                  </span>
                </div>
              </div>
              <Button
                size="lg"
                className="text-lg px-8"
                onClick={() =>
                  document
                    .getElementById("calculator")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                Calculate now
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Mission Calculator Section */}
        <section id="calculator" className="py-12 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Calculator className="h-6 w-6 text-primary" />
                  <h2 className="text-3xl font-bold">Mission Calculator</h2>
                </div>
                <p className="text-muted-foreground">
                  Select multiple missions - click cells to toggle selection
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Side - Tank Selector + Active Tank Grid (2/3 width) */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Tank Selector Tabs */}
                  <div className="flex flex-wrap gap-2">
                    {TANKS.map((tank) => {
                      const tankMissionCount = selectedMissions[tank.id]
                        ? Object.values(selectedMissions[tank.id]).reduce(
                            (a, m) => a + m.length,
                            0
                          )
                        : 0;
                      const isActive = activeTank === tank.id;

                      return (
                        <button
                          key={tank.id}
                          type="button"
                          onClick={() => setActiveTank(tank.id)}
                          className={`relative px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 ${
                            isActive
                              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                              : "bg-card hover:bg-primary/10 text-foreground border-primary/30 hover:border-primary/50"
                          }`}
                        >
                          <span>{tank.name}</span>
                          {tankMissionCount > 0 && (
                            <span
                              className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                                isActive
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-green-500/20 text-green-500"
                              }`}
                            >
                              {tankMissionCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Tank Mission Grid */}
                  {(() => {
                    const tank = TANKS.find((t) => t.id === activeTank)!;
                    const tankMissionCount = selectedMissions[tank.id]
                      ? Object.values(selectedMissions[tank.id]).reduce(
                          (a, m) => a + m.length,
                          0
                        )
                      : 0;
                    const isFullTank = isTankFullSelected(tank.id);

                    return (
                      <Card className="border-2 border-primary/20 bg-card">
                        <CardContent className="pt-3 pb-3">
                          {/* Tank Header */}
                          <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-base text-primary">
                                {tank.name}
                              </span>
                              {tankMissionCount > 0 && (
                                <span className="bg-green-500/20 text-green-500 text-xs px-2 py-0.5 rounded">
                                  {tankMissionCount} selected
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => selectAllTank(tank.id)}
                              className={`text-xs font-bold px-3 py-1 rounded border transition-colors flex items-center gap-2 ${
                                isFullTank
                                  ? "bg-green-500/20 text-green-500 border-green-500/50"
                                  : "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                              }`}
                            >
                              <Award className="h-3 w-3" />
                              {isFullTank
                                ? "All Selected (25% OFF)"
                                : "Select All (25% OFF)"}
                            </button>
                          </div>

                          {/* Mission Grid - Desktop */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full border-collapse text-xs">
                              <thead>
                                <tr>
                                  <th className="p-1 text-left font-medium text-muted-foreground border-b border-border w-24">
                                    Series
                                  </th>
                                  {range1to15().map((num) => (
                                    <th
                                      key={num}
                                      className="p-1 text-center font-medium text-muted-foreground border-b border-border w-8"
                                    >
                                      {num}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {MISSION_TYPES.map((type) => {
                                  const isFullType = isTypeFullSelected(
                                    tank.id,
                                    type.id
                                  );
                                  return (
                                    <tr key={type.id}>
                                      <td className="p-1 font-medium text-xs align-middle">
                                        <div className="flex flex-col gap-0.5">
                                          <span>{type.name}</span>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              selectAllType(tank.id, type.id)
                                            }
                                            className={`text-[8px] px-1 py-0.5 rounded border w-fit whitespace-nowrap ${
                                              isFullType
                                                ? "bg-green-500/20 text-green-500 border-green-500/50"
                                                : "bg-secondary hover:bg-secondary/80 text-muted-foreground border-border"
                                            }`}
                                          >
                                            {isFullType ? "15% OFF" : "All"}
                                          </button>
                                        </div>
                                      </td>
                                      {range1to15().map((num) => {
                                          const isSelected = isMissionSelected(
                                            tank.id,
                                            type.id,
                                            num
                                          );
                                          const price = getMissionPrice(
                                            tank.id,
                                            type.id,
                                            num
                                          );

                                          return (
                                            <td
                                              key={num}
                                              className="p-0.5 align-middle"
                                            >
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  toggleMission(
                                                    tank.id,
                                                    type.id,
                                                    num
                                                  )
                                                }
                                                className={`w-full h-7 rounded text-[10px] font-medium transition-all ${
                                                  isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-secondary/50 hover:bg-primary/20 text-foreground"
                                                }`}
                                              >
                                                ${price}
                                              </button>
                                            </td>
                                          );
                                      })}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Mission Grid - Mobile (3 rows x 5 missions per section) */}
                          <div className="md:hidden space-y-4">
                            {MISSION_TYPES.map((type) => {
                              const isFullType = isTypeFullSelected(
                                tank.id,
                                type.id
                              );
                              return (
                                <div key={type.id} className="border border-border/50 rounded-lg p-3 bg-secondary/10">
                                  {/* Section Header */}
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-sm">{type.name}</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        selectAllType(tank.id, type.id)
                                      }
                                      className={`text-[10px] px-2 py-1 rounded border ${
                                        isFullType
                                          ? "bg-green-500/20 text-green-500 border-green-500/50"
                                          : "bg-secondary hover:bg-secondary/80 text-muted-foreground border-border"
                                      }`}
                                    >
                                      {isFullType ? "15% OFF" : "Select All"}
                                    </button>
                                  </div>
                                  {/* Mission Grid: 3 rows x 5 columns */}
                                  <div className="grid grid-cols-5 gap-1">
                                    {range1to15().map((num) => {
                                      const isSelected = isMissionSelected(
                                        tank.id,
                                        type.id,
                                        num
                                      );
                                      const price = getMissionPrice(
                                        tank.id,
                                        type.id,
                                        num
                                      );

                                      return (
                                        <button
                                          key={num}
                                          type="button"
                                          onClick={() =>
                                            toggleMission(
                                              tank.id,
                                              type.id,
                                              num
                                            )
                                          }
                                          className={`h-10 rounded text-xs font-medium transition-all flex flex-col items-center justify-center ${
                                            isSelected
                                              ? "bg-primary text-primary-foreground"
                                              : "bg-secondary/50 hover:bg-primary/20 text-foreground"
                                          }`}
                                        >
                                          <span className="text-[10px] opacity-60">#{num}</span>
                                          <span>${price}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {/* Quick Actions & Info */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-2">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground italic">
                        *If you need to complete any mission with honors (with second task), it will cost an additional 50% of the mission price. Please leave a comment in the order form or contact our manager.
                      </p>
                    </div>
                    {totalMissions > 0 && (
                      <button
                        type="button"
                        onClick={clearAllSelections}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 flex-shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Side - Selected Missions Panel (1/3 width) */}
                <div className="lg:col-span-1">
                  <Card className="border-2 border-primary/20 bg-card h-full">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Selected Missions</span>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                          {totalMissions} selected
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      {Object.keys(selectedMissions).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          <p>No missions selected</p>
                          <p className="text-xs mt-1">
                            Click on cells in the grid to add missions
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto">
                          {Object.entries(selectedMissions).map(
                            ([tankId, missionTypes]) => {
                              const tank = TANKS.find((t) => t.id === tankId);
                              const isFullTank = isTankFullSelected(tankId);

                              return (
                                <div
                                  key={tankId}
                                  className="bg-secondary/30 rounded-lg p-3 relative"
                                >
                                  {isFullTank && (
                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] px-2 py-0.5 rounded-bl font-bold">
                                      25% OFF
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sm text-primary">
                                      {tank?.name}:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        clearTankSelections(tankId)
                                      }
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <div className="space-y-1">
                                    {Object.entries(missionTypes).map(
                                      ([typeId, missions]) => {
                                        const type = MISSION_TYPES.find(
                                          (t) => t.id === typeId
                                        );
                                        const isFullType =
                                          missions.length === MISSIONS_PER_TYPE;
                                        const sortedMissions = [
                                          ...missions,
                                        ].sort((a, b) => a - b);

                                        return (
                                          <div
                                            key={typeId}
                                            className="flex items-start gap-2 text-sm"
                                          >
                                            <span className="text-muted-foreground font-medium min-w-[32px]">
                                              {type?.name}:
                                            </span>
                                            <span className="text-foreground">
                                              {isFullType ? (
                                                <span className="text-green-500 font-medium">
                                                  All (1-15)
                                                </span>
                                              ) : (
                                                sortedMissions.join(", ")
                                              )}
                                            </span>
                                            {!isFullTank && isFullType && (
                                              <span className="text-[9px] text-green-500 font-bold ml-auto">
                                                15% OFF
                                              </span>
                                            )}
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}

                      {/* Price Summary */}
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-muted-foreground">
                            Base price:
                          </span>
                          <span>${priceDetails.original}</span>
                        </div>
                        {priceDetails.discount > 0 && (
                          <div className="flex justify-between items-center text-sm mb-1 text-green-500">
                            <span>Discount:</span>
                            <span>-${priceDetails.discount}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                          <span className="font-semibold">Total:</span>
                          <span className="text-2xl font-bold text-primary">
                            ${priceDetails.total}
                          </span>
                        </div>
                        <Button
                          className="w-full mt-4"
                          onClick={() =>
                            document
                              .getElementById("order-form")
                              ?.scrollIntoView({ behavior: "smooth" })
                          }
                          disabled={totalMissions === 0}
                        >
                          Continue the order
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Order Form Section */}
        <section id="order-form" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Complete Your Order
                  </CardTitle>
                  <CardDescription>
                    Fill in your details to finalize your mission order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        {...form.register("email")}
                        className="bg-background"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Discord Tag */}
                    <div className="space-y-2">
                      <label
                        htmlFor="discordTag"
                        className="text-sm font-medium"
                      >
                        Discord Tag *
                      </label>
                      <Input
                        id="discordTag"
                        placeholder="Username#1234"
                        {...form.register("discordTag")}
                        className="bg-background"
                      />
                      {form.formState.errors.discordTag && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.discordTag.message}
                        </p>
                      )}
                    </div>

                    {/* Server */}
                    <div className="space-y-2">
                      <label htmlFor="server" className="text-sm font-medium">
                        Server *
                      </label>
                      <select
                        id="server"
                        {...form.register("server")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select server...</option>
                        <option value="na">North America</option>
                        <option value="eu">Europe</option>
                        <option value="asia">Asia</option>
                        <option value="ru">Russia</option>
                      </select>
                      {form.formState.errors.server && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.server.message}
                        </p>
                      )}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                      <div className="text-sm font-semibold mb-2">
                        Order Summary:
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Campaign:
                          </span>
                          <span className="font-medium">
                            3.0
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Missions Selected:
                          </span>
                          <span className="font-medium">{totalMissions}</span>
                        </div>
                        {Object.entries(selectedMissions).map(
                          ([tankId, missionTypes]) => {
                            const tank = TANKS.find((t) => t.id === tankId);
                            const missionCount = Object.values(
                              missionTypes
                            ).reduce((a, m) => a + m.length, 0);
                            const isFullTank = isTankFullSelected(tankId);

                            return (
                              <div
                                key={tankId}
                                className="flex justify-between pl-2 text-xs"
                              >
                                <span className="text-muted-foreground">
                                  • {tank?.name}:
                                </span>
                                <div className="flex items-center gap-2">
                                  <span>{missionCount} missions</span>
                                  {isFullTank && (
                                    <span className="text-green-500 font-bold text-[10px]">
                                      25% OFF
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}

                        <div className="border-t border-border pt-2 mt-2 space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Base Price:</span>
                            <span>${priceDetails.original}</span>
                          </div>
                          {priceDetails.discount > 0 && (
                            <div className="flex justify-between text-xs text-green-500">
                              <span>Total Discount:</span>
                              <span>-${priceDetails.discount}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-1">
                            <span className="text-muted-foreground">
                              Total Price:
                            </span>
                            <span className="font-bold text-primary text-lg">
                              ${priceDetails.total}.00
                            </span>
                          </div>
                        </div>
                      </div>
                      {totalMissions === 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          *Please use the calculator above to select your
                          missions first
                        </p>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-2">
                      <label
                        htmlFor="additionalInfo"
                        className="text-sm font-medium"
                      >
                        Additional Information (Optional)
                      </label>
                      <textarea
                        id="additionalInfo"
                        {...form.register("additionalInfo")}
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="Any specific requirements or preferences..."
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full h-12 text-base"
                      size="lg"
                      disabled={totalMissions === 0 || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending Order...
                        </>
                      ) : (
                        <>
                          {totalMissions > 0
                            ? `Submit Order - $${priceDetails.total}`
                            : "Select Missions in Calculator First"}
                          <ChevronRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By submitting this form, you agree to our Terms of Service
                      and Privacy Policy. We&apos;ll contact you within 30
                      minutes to confirm your order.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">
                Why Choose Our Service?
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">100% Secure</h3>
                    <p className="text-sm text-muted-foreground">
                      VPN protection, encrypted connections, and complete
                      privacy guaranteed.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Expert Players</h3>
                    <p className="text-sm text-muted-foreground">
                      Campaign specialists with proven track records of
                      completion.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Progress Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time updates on mission completion and progress
                      milestones.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Guaranteed Results</h3>
                    <p className="text-sm text-muted-foreground">
                      We complete the missions or your money back - no questions
                      asked.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
