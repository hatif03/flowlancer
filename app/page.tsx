"use client";

import { useAccount } from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import Image from "next/image";
import { Bot, Shield, Rocket, Eye, Users, Share } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

// Use Cases data
const USE_CASES = [
  {
    title: "AI-Powered Developer Onboarding",
    image: "/home/DeveloperEducation.jpg",
    description: "Empower developers by offering tailored learning paths, collaborative projects, and incentive-driven milestones, all guided by AI.",
    features: [
      "Foster collaboration through study groups and project-based learning",
      "Reward developers with tokens and reputation for achieving key project milestones",
      "Leverage AI for smart code evaluations and personalized development feedback"
    ],
    reverse: false
  },
  {
    title: "Growth Hacking & Community Engagement",
    image: "/home/ProductTesting.jpg",
    description: "Supercharge your growth strategy with gamified tasks, automated airdrops, and seamless community engagement driven by AI.",
    features: [
      "Launch customizable tasks like social media engagement, reviews, and referrals",
      "AI-driven community management with automated responses, engagement, and support",
      "Effortless token distribution and task verification for a seamless user experience"
    ],
    reverse: true
  },
  {
    title: "Decentralized Community Empowerment",
    image: "/home/CommunityBuilding.jpg",
    description: "Unlock the power of DAOs by organizing community events and rewarding active participation with automated, fair distribution systems.",
    features: [
      "AI-based engagement tracking across Discord, Telegram, and social platforms",
      "Automated community event creation with instant reward distribution for participants",
      "Incentivized governance participation through smart contracts and token-based rewards"
    ],
    reverse: false
  }
];

// Features data
const FEATURES = [
  {
    title: "Effortless Task Creation",
    description: "Create and manage community tasks quickly with a streamlined process. Set up bounty boards, define objectives, and manage rewards all from one easy-to-use platform.",
    icon: Rocket
  },
  {
    title: "AI-Powered Task Verification",
    description: "Automate task verification and evaluation with AI. Ensure accurate assessments and customizable review workflows for seamless community participation.",
    icon: Bot
  },
  {
    title: "Blockchain-Backed Rewards",
    description: "Automate reward distribution through secure smart contracts, ensuring that participants are rewarded instantly and without error, all while maintaining transparency.",
    icon: Shield
  },
  {
    title: "Real-Time Community Insights",
    description: "Monitor community engagement and performance with real-time data. Track activity, participation, and growth across all channels, ensuring a proactive approach to management.",
    icon: Eye
  }
];

function HomePageInner() {
  const { address } = useAccount();
  const { toast } = useToast();
  const router = useRouter();

  const handleCreateBoard = () => {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to create a board",
      });
      return;
    }
    router.push("/boards/create");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[600px] w-full">
      
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        <div className="relative container mx-auto h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 glow-text animate-fade-in">
            Welcome to Flowlancer
          </h1>
          <p className="text-base md:text-xl text-purple-200/90 max-w-3xl mb-6 md:mb-8 animate-fade-in-delay">
            A Web3-native platform revolutionizing community engagement and task
            management. Create, manage, and participate in bounty tasks with
            transparency and efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link
              href="/boards"
              className="w-full sm:w-auto neon-button-primary group animate-fade-in-delay-2"
            >
              <span className="relative z-10 flex items-center justify-center">
                Explore Boards
                <svg
                  className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </Link>
            <button
              type="button"
              onClick={handleCreateBoard}
              className="w-full sm:w-auto neon-button-secondary group animate-fade-in-delay-2"
            >
              <span className="relative z-10 flex items-center justify-center">
                Create Board
                <svg
                  className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      {/* Use Cases Section */}
<div className="bg-gradient-to-br from-[#0b1727] via-[#102a44] to-[#1b3a56] py-16 md:py-24">
  <div className="container mx-auto px-6">
    <div className="grid grid-cols-1 gap-8 md:gap-12">
      {USE_CASES.map((useCase, index) => (
        <div 
          key={index} 
          className="group relative bg-white/5 border border-cyan-500/20 backdrop-blur-lg p-6 md:p-10 rounded-3xl shadow-xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/20"
        >
          <div className={`flex flex-col ${useCase.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-6 md:gap-10 items-center`}>
            
            {/* Image */}
            <div className="w-full md:w-1/2">
              <div className="relative aspect-square max-w-[220px] md:max-w-[300px] mx-auto">
                <Image
                  src={useCase.image}
                  alt={useCase.title}
                  fill
                  className="rounded-xl object-cover border border-cyan-500/40 shadow-lg group-hover:shadow-cyan-400/50 transition-all duration-300"
                />
              </div>
            </div>

            {/* Content */}
            <div className="w-full md:w-1/2 space-y-4">
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 group-hover:from-cyan-300 group-hover:to-teal-400 transition-all duration-300">
                {useCase.title}
              </h3>
              <p className="text-lg text-gray-300">
                {useCase.description}
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-400 text-base">
                {useCase.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="transition-all duration-300 group-hover:text-gray-200">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>


      {/* Features Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {FEATURES.map((feature, index) => (
            <div key={index} className="glass-card p-4 md:p-8 rounded-2xl">
              <div className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center">
                <feature.icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-purple-300">
                {feature.title}
              </h2>
              <p className="text-sm md:text-base text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

    
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageInner />
    </Suspense>
  );
}
