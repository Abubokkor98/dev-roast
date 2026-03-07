import type { Metadata } from "next";
import { Header } from "@/components/header";
import { ResultsContent } from "@/components/results-content";

interface ResultsPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: ResultsPageProps): Promise<Metadata> {
  const { username } = await params;

  const title = `${username}'s Dev Roast - GitHub Profile Roasted`;
  const description = `See @${username}'s developer archetype, roast score, and GitHub profile roast. Get your own at Dev Roast!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: `/api/og?username=${encodeURIComponent(username)}`,
          width: 1200,
          height: 630,
          alt: `${username}'s Dev Roast`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?username=${encodeURIComponent(username)}`],
    },
  };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { username } = await params;

  return (
    <>
      <Header />
      <ResultsContent username={username} />
    </>
  );
}
