import { type FunctionalComponent } from "react";
import Button from "@mui/material/Button";
import data from "../content/trace.json";

interface Props {}

export const Simulation: FunctionalComponent<Props> = ({}) => {
  const dnsServer = new DNSServerSimulator(0.05);
  dnsServer.handleRequests(data);
  console.log(dnsServer);

  return (
    <div>
      <Button>Simulate</Button>
    </div>
  );
};

interface DNSRequest {
  arrivedAtMS: number;
  processingTimeMS: number;
  sourceIP: string;
  isCached: boolean;
  isAttack: boolean;
}

class DNSServerSimulator {
  currentTimeMS: number;
  droppedQueries: number;
  rhhh: RHHH;
  threshold: number;

  totalRequests: number;
  totalRequestsBlocked: number;
  attackRequestsBlocked: number;
  legitimateRequestsBlocked: number;
  totalCPUTime: number;
  totalCPUTimeUsed: number;
  totalCPUTimeSaved: number;

  totalRequestsData: number[];
  totalRequestsBlockedData: number[];
  attackRequestsBlockedData: number[];
  legitimateRequestsBlockedData: number[];
  totalCPUTimeData: number[];
  totalCPUTimeUsedData: number[];
  totalCPUTimeSavedData: number[];

  constructor(rhhhThreshold: number) {
    this.currentTimeMS = 0;
    this.droppedQueries = 0;
    this.rhhh = new RHHH(5, 0);
    this.threshold = rhhhThreshold;

    this.totalRequests = 0;
    this.totalRequestsBlocked = 0;
    this.attackRequestsBlocked = 0;
    this.legitimateRequestsBlocked = 0;
    this.totalCPUTime = 0;
    this.totalCPUTimeUsed = 0;
    this.totalCPUTimeSaved = 0;

    this.totalRequestsData = [];
    this.totalRequestsBlockedData = [];
    this.attackRequestsBlockedData = [];
    this.legitimateRequestsBlockedData = [];
    this.totalCPUTimeData = [];
    this.totalCPUTimeUsedData = [];
    this.totalCPUTimeSavedData = [];
  }

  private pushCountersToData() {
    this.totalRequestsData.push(this.totalRequests);
    this.totalRequestsBlockedData.push(this.totalRequestsBlocked);
    this.attackRequestsBlockedData.push(this.attackRequestsBlocked);
    this.legitimateRequestsBlockedData.push(this.legitimateRequestsBlocked);
    this.totalCPUTimeData.push(this.totalCPUTime);
    this.totalCPUTimeUsedData.push(this.totalCPUTimeUsed);
    this.totalCPUTimeSavedData.push(this.totalCPUTimeSaved);
  }

  handleDNS(request: DNSRequest) {
    this.rhhh.update({
      sourceIP: request.sourceIP,
    });

    // TODO Use the value from RHHH to protect the server somehow.
    // Calculate the time saved by blocking requests?
    // Change the algorithm to look up all hitters from subnets?
    //
    // Exported values:
    // - % requests blocked
    // - % attack requests blocked
    // - % legitimate requests blocked
    // - time saved by blocking
    //
    // Should export a data point for each reques processed and generate a time graph?

    this.totalRequests++;

    if (!request.isCached) {
      const randomPrefix = request.sourceIP
        .split(".")
        .slice(0, 1 + Math.floor(Math.random() * 4))
        .join(".");
      const isHeavyHitter = this.rhhh.query(randomPrefix, this.threshold);
      if (isHeavyHitter) {
        // Increment statistics counters.
        this.totalRequestsBlocked++;
        if (request.isAttack) {
          this.attackRequestsBlocked++;
        } else {
          this.legitimateRequestsBlocked++;
        }
        this.totalCPUTime += request.processingTimeMS;
        this.totalCPUTimeSaved += request.processingTimeMS;
        this.pushCountersToData();
        return;
      }
    }

    this.totalCPUTime += request.processingTimeMS;
    this.totalCPUTimeUsed += request.processingTimeMS;

    const queueTime = this.currentTimeMS - request.arrivedAtMS;
    if (queueTime < 0) {
      // Server was waiting for the request.
      this.currentTimeMS = request.arrivedAtMS;
    }

    // Process the request.
    this.currentTimeMS += request.processingTimeMS;
    this.pushCountersToData();
  }

  handleRequests(requests: DNSRequest[]) {
    for (const request of requests) {
      this.handleDNS(request);
    }
  }
}

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

interface Packet {
  sourceIP: string;
  // destinationIP: string;
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
