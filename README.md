# Flowlancer

Flowlancer is a decentralized Web3 community engagement platform that leverages blockchain technology and AI-powered agents to streamline task management and reward distribution.

## Key Benefits
* **Decentralization**: Flowlancer utilizes blockchain technology to ensure transparency and trust in platform operations.
* **Smart Contracts**: The platform automates task management and reward distribution using smart contracts, improving efficiency and transparency.
* **AI-Powered Agent (Eliza)**: Eliza provides intelligent Q&A, task auditing, data analysis, and task notifications to enhance community interaction and efficiency.
* **User-Friendly Interface**: Flowlancer offers a simple and intuitive interface for users to create and manage tasks, track progress, and monitor participation.

## Key Features
* **Task Management**: Flowlancer supports multiple task types, customizable completion criteria, and a progress tracking dashboard.
* **Reward Distribution**: The platform automates reward distribution using smart contracts and supports multiple tokens.
* **Community Management**: Eliza offers intelligent Q&A, task auditing, data analysis, and task notifications, while community verification ensures privacy and security.

## Use Cases
* **Developer Education**: Flowlancer attracts developers to project ecosystems through AI-powered learning paths and incentivized development programs.
* **Product Attraction and Testing**: The platform enables engaging tasks and airdrops to attract users, boost product adoption, and build vibrant communities.
* **Community Building**: Flowlancer encourages DAO members to organize and participate in community activities with automated reward distribution.

## Platform Advantages
* **Transparency and Trust**: Blockchain technology ensures transparency and trust in platform operations.
* **Automation and Efficiency**: Smart contracts and Eliza automate task management and reward distribution, improving efficiency.
* **Flexibility and Scalability**: Flowlancer supports multiple task types and tokens, catering to different community needs.
* **Data Analysis**: The platform provides data analysis features to help communities make informed decisions.

## Integration with Partner Technologies
Flowlancer integrates with several partner technologies to enhance its functionality and security, including:
* **Autonome**: Enables the deployment of Eliza with customizable knowledge bases, tailored to specific auditing needs, and provides a secure and auditable environment for Eliza to operate.
* **Flow**: Provides a scalable and interoperable blockchain architecture that allows Flowlancer to connect with other blockchain networks.

## Technology Stack
Flowlancer is built on a decentralized architecture, utilizing a combination of blockchain, artificial intelligence, and web technologies. The core components of our technology stack include:
* **Blockchain**: Flow blockchain framework
* **Smart Contracts**: Solidity programming language
* **AI-Powered Agent (Eliza)**: Multi-agent simulation framework built with TypeScript
* **Frontend and Backend**: Next.js with GraphQL API
* **Cursor AI**: Improves development experience and speed

## Getting Started
To get started with Flowlancer, please visit our website and follow the instructions to create an account and start exploring the platform.


## Start

### Install

First, install the dependencies:

```bash
pnpm install
```

Second, set the environment variables:

```bash
cp .env.example .env
```

### Run

```bash
pnpm dev
```

## Set up the agent

First, clone the agent repository:

```bash
git clone https://github.com/ai16z/eliza.git
```

Second, set the environment variables, you need to set the `DISCORD_APPLICATION_ID`, `DISCORD_API_TOKEN`,`BOUNTYBOARD_PRIVATE_KEY`(the private key of the account that will review the tasks), `BOUNTYBOARD_ADDRESS`, `GAIANET_MODEL`, `GAIANET_SERVER_URL`, `GAIANET_EMBEDDING_MODEL`, `USE_GAIANET_EMBEDDING`, `DSTACK_SIMULATOR_ENDPOINT`(the endpoint of the TEE simulator), `WALLET_SECRET_SALT`(the TEE secret salt) in the `.env` file.

```bash
cp .env.example .env
```

Third, install the dependencies:

```bash
pnpm install
```

Fourth, copy the `eliza-add` directory to the `eliza` directory:

Then, you can build and start the agent:

```bash
pnpm build
pnpm start --characters="characters/BountyBoard.character.json"
```
