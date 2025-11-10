import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, BookOpen, Users, FileText, HeartHandshake, Briefcase } from 'lucide-react';

interface ResourceLink {
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  testId: string;
}

export default function Resources() {
  const fellowshipResources: ResourceLink[] = [
    {
      title: 'Find NA Meetings',
      description: 'Searchable map of NA meetings across Australia',
      url: 'https://www.na.org.au/multi/searchable-map/',
      icon: <Users className="h-5 w-5" />,
      testId: 'link-find-meetings'
    },
    {
      title: 'Print Meeting Lists',
      description: 'Download and print local meeting schedules',
      url: 'https://www.na.org.au/multi/print-a-meetings-list/',
      icon: <FileText className="h-5 w-5" />,
      testId: 'link-print-meetings'
    },
    {
      title: 'NA Today Blog',
      description: 'Recovery stories and insights from Australian members',
      url: 'https://www.na.org.au/multi/category/na-today-blog/',
      icon: <BookOpen className="h-5 w-5" />,
      testId: 'link-na-today'
    }
  ];

  const literatureResources: ResourceLink[] = [
    {
      title: 'Information About NA',
      description: 'Learn about Narcotics Anonymous and how it works',
      url: 'http://www.na.org/admin/include/spaw2/uploads/pdf/PR/Information_about_NA.pdf',
      icon: <BookOpen className="h-5 w-5" />,
      testId: 'link-info-brochure'
    },
    {
      title: 'Australian NA Member Survey',
      description: 'Insights from NA members across Australia',
      url: 'https://www.na.org.au/multi/2013-na-members-survey/',
      icon: <FileText className="h-5 w-5" />,
      testId: 'link-member-survey'
    }
  ];

  const professionalResources: ResourceLink[] = [
    {
      title: 'Information for Professionals',
      description: 'Resources for counselors, healthcare workers, and legal professionals',
      url: 'https://www.na.org.au/multi/healthcare-professionals/',
      icon: <Briefcase className="h-5 w-5" />,
      testId: 'link-professionals'
    },
    {
      title: 'Request a Presentation',
      description: 'Book an NA presentation for your staff or clients',
      url: 'https://www.na.org.au/multi/contact-public-relations/',
      icon: <HeartHandshake className="h-5 w-5" />,
      testId: 'link-presentation'
    },
    {
      title: 'Online H&I Presentations',
      description: 'Request virtual presentations for hospitals and institutions',
      url: 'https://www.na.org.au/multi/online-hospitals-and-institutions-hi-presentations/',
      icon: <Users className="h-5 w-5" />,
      testId: 'link-online-hi'
    }
  ];

  const renderResourceSection = (title: string, description: string, resources: ResourceLink[]) => (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-3">
        {resources.map((resource) => (
          <a
            key={resource.testId}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            data-testid={resource.testId}
          >
            <Card className="hover-elevate active-elevate-2 cursor-pointer">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-primary mt-1">
                    {resource.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base mb-1">{resource.title}</CardTitle>
                    <CardDescription className="text-sm">{resource.description}</CardDescription>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>
    </section>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 pb-32 pt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-resources-title">
          NA Resources
        </h1>
        <p className="text-base text-muted-foreground">
          Helpful links and information from Narcotics Anonymous Australia
        </p>
      </header>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-primary" />
            Quick Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="font-semibold">NA Helpline</div>
              <div className="text-sm text-muted-foreground">24/7 recovery support</div>
            </div>
            <a
              href="tel:1300652820"
              className="text-primary font-bold hover:underline text-lg whitespace-nowrap"
              data-testid="link-helpline"
            >
              1300 652 820
            </a>
          </div>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="font-semibold">Meeting Info Line</div>
              <div className="text-sm text-muted-foreground">Call or SMS for meetings near you</div>
            </div>
            <a
              href="tel:0488811247"
              className="text-primary font-bold hover:underline text-lg whitespace-nowrap"
              data-testid="link-meeting-info"
            >
              0488 811 247
            </a>
          </div>
        </CardContent>
      </Card>

      {renderResourceSection(
        'Fellowship Resources',
        'Find meetings, connect with the fellowship, and read recovery stories',
        fellowshipResources
      )}

      {renderResourceSection(
        'NA Literature & Information',
        'Learn more about Narcotics Anonymous and read member experiences',
        literatureResources
      )}

      {renderResourceSection(
        'Professional Resources',
        'Information for counselors, healthcare providers, and institutions',
        professionalResources
      )}

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> All external links open the official NA Australia website. This app is an independent tool for personal recovery support and is not affiliated with or endorsed by Narcotics Anonymous.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
