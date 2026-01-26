'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Target, LineChart, Plus, ArrowUpRight } from "lucide-react";
import { format } from 'date-fns';
import { SyringeIcon } from '@/components/icons/syringe';
import Link from 'next/link';

export function Dashboard() {
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        // This runs only on the client, after hydration
        setCurrentDate(format(new Date(), 'eeee, MMMM d'));
    }, []);

    return (
        <div className="mx-auto grid w-full max-w-7xl flex-1 items-start gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">{currentDate}</p>
                </div>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Quick Log
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Blood Glucose Card */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <Droplet className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold">Blood Glucose</CardTitle>
                                    <p className="text-sm text-muted-foreground">0 readings today</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col items-center justify-center text-center gap-4 py-6">
                        <p className="text-muted-foreground">No readings yet</p>
                        <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Reading
                        </Button>
                    </CardContent>
                </Card>

                {/* Insulin on Board Card */}
                <Card className="flex flex-col">
                    <CardHeader>
                         <div className="flex items-center gap-3">
                            <div className="bg-accent/10 p-3 rounded-full">
                                <SyringeIcon className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold">Insulin on Board</CardTitle>
                                <p className="text-sm text-muted-foreground">Insulin</p>
                            </div>
                         </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-center gap-4 py-6">
                        <div>
                            <span className="text-4xl font-bold text-accent">0</span>
                            <span className="text-lg text-muted-foreground ml-2">units active</span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-4 mt-2">
                            <span className="text-sm text-muted-foreground">Total today</span>
                            <span className="text-sm font-semibold">0 units</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Time in Range Card */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-full" style={{ backgroundColor: 'hsla(var(--chart-2), 0.1)' }}>
                                <Target className="h-6 w-6" style={{ color: 'hsl(var(--chart-2))' }}/>
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold">Time in Range</CardTitle>
                                <p className="text-sm text-muted-foreground">Last 7 days</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 items-center justify-center text-center py-6">
                        <p className="text-muted-foreground max-w-xs">Not enough data yet. Log more readings to see your time in range</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                {/* Dose Calculator Card */}
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-accent/10 p-3 rounded-full">
                                <SyringeIcon className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Dose Calculator</h3>
                                <p className="text-sm text-muted-foreground">Calculate your insulin dose</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon">
                            <Plus className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </CardContent>
                </Card>
                
                {/* AI Insights Card */}
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <Link href="/ai-insights" className="block w-full h-full">
                        <CardContent className="p-6 flex items-center justify-between h-full">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full" style={{ backgroundColor: 'hsla(var(--chart-1), 0.1)' }}>
                                    <LineChart className="h-6 w-6" style={{ color: 'hsl(var(--chart-1))' }}/>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">AI Insights</h3>
                                    <p className="text-sm text-muted-foreground">Predictions & recommendations</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon">
                                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </CardContent>
                    </Link>
                </Card>
            </div>
        </div>
    );
}
