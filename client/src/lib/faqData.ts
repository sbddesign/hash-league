export interface FaqItem {
  question: string;
  answer: string;
}

export const faqData: FaqItem[] = [
  {
    question: "Why does Hash League exist?",
    answer: "To fight mining pool centralization in a fun way!"
  },
  {
    question: "What does it mean to share my hash rate to a mining pool?",
    answer: "Sharing your mining device's computational power with a mining pool means contributing your device's hash calculations that it can perform per second to find a valid block in order to work together to solve for a Bitcoin block and earn a reward."
  },
  {
    question: "Can I participate in Hash League independent of a meetup?",
    answer: "Yes you can set up your own mining operation, for example using a BitAxe, and you can point your hash rate to any of the available public pools to participate."
  },
  {
    question: "How can I participate in a public pool without doxing my information?",
    answer: `While it's difficult to fully obscure your contribution, there are several techniques to obfuscate, anonymize, or reduce the traceability of your mining activity:
1. Use a Proxy or Mining Proxy Pool
Setup: Route your miners through a Stratum proxy, which aggregates traffic from multiple miners and presents them to the public pool as a single worker.
Effect: The pool sees only the proxy's total hashrate, not each individual miner behind it.
Popular tools: Stratum Proxy,Foreman, or custom pool software.
2. Randomize or Rotate Worker Names
Use frequently changing or generic worker names (e.g., anon1, x123, temp_worker) to make it harder to correlate activity over time.
Combine this with no user-identifiable info in your pool account or payout address.
3. Use VPN or Tor for Network Privacy
Connect to the mining pool using a VPN or Tor, hiding your IP address and geolocation.
Some pools block Tor by default due to abuse, but privacy-friendly pools (like CKPool or P2Pool) may support it.
You can also use SOCKS5 proxy over Tor with mining software like cgminer or bfgminer.
4. Throttle or Randomize Hashrate
Intentionally limit or fluctuate your hashrate using mining software tools to make detection or correlation with known ASIC signatures more difficult.
Note: this reduces profitability and can still be fingerprinted by pool operators who analyze share timing or difficulty.
5. Mine via P2Pool or Decentralized Pools
Consider mining via P2Pool, a decentralized pool that doesn't rely on a central server, reducing traceability.
Newer efforts like Ocean, BraiinsOS+ custom pools, or obfuscated relay nodes aim to improve mining privacy at a protocol level.
6. Avoid Public Payout Addresses
Use fresh Bitcoin addresses (preferably with coin control and mixing via tools like Whirlpool or CoinJoin) to reduce linkage between your hashrate and your on-chain identity.`
  },
  {
    question: "If a block reward is won, will I receive the full block coinbase or will it be shared with the pool that I am participating in?",
    answer: "This will be determined by the public pool you joined. Please check closely the payment payout rules prior to joining any public pool."
  },
  {
    question: "Can you configure the miner to receive the block reward payment independent of the pool owner? (i.e not making the pool owner a custodian of the reward)",
    answer: `These are some non-custodial setups that are possible:

Solo mining using a hydra pool instance to win a full reward
PPLNS is another non-custodial solution limited to a number of miners that can participate in the pool. Payout is sent directly to the coinbase (similar to Ocean pool mining if you are familiar)
There is a P2P pool that does payouts on a coinbase using atomic swaps over lightning refer Blog for more information`
  },
  {
    question: "I'm a meetup organizer, How do I quickly setup my own pool for my meetup?",
    answer: `We recommend one of the following options:
Umbrel - https://community.umbrel.com/t/public-pool-set-up/15495
AWS Instance - https://awscli.amazonaws.com/v2/documentation/api/latest/reference/ec2/create-public-ipv4-pool.html

Refer to 256foundation.org for further options on open source pool creations and different payment payout mechanisms`
  }
];