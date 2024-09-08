import { type FunctionalComponent } from "react";
import Button from "@mui/material/Button";
import data from "../content/data.json";

interface Props {}

export const Simulation: FunctionalComponent<Props> = ({}) => {
  const rhhh = new RHHH(5, 0.1);
  for (const packet of data) {
    rhhh.update({
      sourceIP: packet.src,
      destinationIP: packet.dst,
    });
  }
  console.log(rhhh.query("125.200", 0.05));
  return (
    <div>
      <Button>Simulate</Button>
    </div>
  );
};

class RHHH {
  private levels: HeavyHitter[];
  private H: number; // Size of the hierarchy
  private packetsArrived: number;

  constructor(H: number, epsilon: number) {
    this.H = H;
    this.levels = new Array(H).fill(null).map(() => new HeavyHitter(epsilon));
    this.packetsArrived = 0;
  }

  update(packet: Packet): void {
    // Randomly select a single level to update
    const levelToUpdate = Math.floor(Math.random() * this.H);

    // Update only the selected level
    this.levels[levelToUpdate].update(packet, levelToUpdate);
    this.packetsArrived++;
  }

  query(prefix: string, threshold: number): boolean {
    let sum = 0;
    for (let i = this.H - 1; i >= 0; i--) {
      sum += this.levels[i].query(prefix);
    }

    return sum >= this.packetsArrived * threshold;
  }
}

class HeavyHitter {
  private epsilon: number;
  private counters: Map<string, number>;

  constructor(epsilon: number) {
    this.epsilon = epsilon;
    this.counters = new Map();
  }

  update(packet: Packet, levelToUpdate: number): void {
    // Implement Space Saving algorithm or another HH algorithm
    // This is a simplified version
    const key = ipv4ToSubnet(packet.sourceIP, 8 * levelToUpdate);
    this.counters.set(key, (this.counters.get(key) || 0) + 1);
  }

  query(prefix: string): number {
    // Implement query logic
    // This is a simplified version
    return Array.from(this.counters.entries())
      .filter(([key, _]) => key.startsWith(prefix))
      .reduce((acc, [_, count]) => acc + count, 0);
  }
}

interface HeavyHitterResult {
  prefix: string;
  count: number;
}

interface Packet {
  sourceIP: string;
  destinationIP: string;
  // Other packet information
}

function ipv4ToSubnet(ipv4: string, bits: number): string {
  const ip = ipv4.split(".");
  if (bits == 0) {
    return "0.0.0.0/0";
  }
  if (bits == 8) {
    return `${ip[0]}.0.0.0/8`;
  }
  if (bits == 16) {
    return `${ip[0]}.${ip[1]}.0.0/16`;
  }
  if (bits == 24) {
    return `${ip[0]}.${ip[1]}.${ip[2]}.0/24`;
  }
  return `${ip[0]}.${ip[1]}.${ip[2]}.${ip[3]}`;
}
