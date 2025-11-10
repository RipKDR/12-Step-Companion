import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, BookMarked, TrendingUp, Trophy, Users, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function ExplorePanel() {
  return (
    <div className="space-y-6 px-6">
      {/* Resources */}
      <section aria-label="Resources">
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Resources & Tools
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Explore additional support and features
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="https://www.na.org.au/multi/category/na-today-blog/"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-daily-inspiration"
          >
            <Card className="cursor-pointer hover-elevate active-elevate-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Daily Fellowship</h3>
                      <p className="text-xs text-muted-foreground">Recovery stories & insights</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          </a>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/journal">
              <Card className="cursor-pointer hover-elevate active-elevate-2" data-testid="button-journal">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <BookMarked className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Journal</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="cursor-pointer hover-elevate active-elevate-2" data-testid="button-analytics">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Analytics</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/achievements">
              <Card className="cursor-pointer hover-elevate active-elevate-2" data-testid="button-achievements">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <Trophy className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Achievements</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/contacts">
              <Card className="cursor-pointer hover-elevate active-elevate-2" data-testid="button-contacts">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Contacts</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Additional quick links could go here */}
      <section className="pb-8">
        <p className="text-center text-xs text-muted-foreground">
          Swipe to navigate between panels
        </p>
      </section>
    </div>
  );
}
