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
      <div className="relative h-[650px] w-full bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#233554]">
  {/* Overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent" />

  <div className="relative container mx-auto h-full flex flex-col items-center justify-center text-center px-6">
    {/* Title */}
    <h1 className="text-5xl md:text-7xl pb-3 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 shadow-md drop-shadow-lg animate-fade-in">
      Empowering Web3 Innovation
    </h1>

    {/* Subtitle */}
    <p className="text-lg md:text-2xl text-gray-300 mt-4 max-w-3xl animate-fade-in-delay">
      A decentralized platform for seamless collaboration, bounties, and task management—powered by the blockchain.
    </p>

    {/* Buttons */}
    <div className="flex flex-col sm:flex-row gap-5 mt-6 md:mt-8">
      <Link href="/boards" className="relative px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl shadow-lg transition-all duration-300 hover:from-teal-400 hover:to-blue-500 transform hover:scale-105">
        Explore Boards
      </Link>

      <button
        type="button"
        onClick={handleCreateBoard}
        className="relative px-6 py-3 text-lg font-medium text-cyan-300 bg-transparent border border-cyan-500/60 rounded-xl shadow-md backdrop-blur-md transition-all duration-300 hover:text-cyan-200 hover:border-cyan-400 transform hover:scale-105"
      >
        Create Board
      </button>
    </div>
  </div>
</div>


     
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
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
    {FEATURES.map((feature, index) => (
      <div key={index} className="glass-card p-6 md:p-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600">
        <div className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
          <feature.icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white hover:text-pink-200 transition-colors">
          {feature.title}
        </h2>
        <p className="text-lg md:text-xl text-gray-200 opacity-90 hover:opacity-100 transition-opacity">
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
