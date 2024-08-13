type IPv4 = [number, number, number, number];

function ipv4ToSubnet(ip: IPv4, bits: 8 | 16 | 24 | 32): string {
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

interface DNSRequest {
  arrivedAtMS: number;
  processingTimeMS: number;
  source: IPv4;
}

class RHHH {
  // Map of subnets to array of request arrival times from each subnet.
  hits: Map<string, number[]>;

  constructor() {
    this.hits = new Map();
  }

  // Returns true when the IP is of a heavy hitter subnet.
  updateAndCheckIfHeavyHitter(source: IPv4): boolean {
    // TODO Implement RHHH algorithm.
    return false;
  }
}

class DNSServerSimulator {
  currentTimeMS: number;
  droppedQueries: number;
  rhhh: RHHH;

  constructor() {
    this.currentTimeMS = 0;
    this.droppedQueries = 0;
    this.rhhh = new RHHH();
  }

  handleDNS(request: DNSRequest) {
    const isHeavyHitter = this.rhhh.updateAndCheckIfHeavyHitter(request.source);
    // TODO Use the value from RHHH to protect the server somehow.

    const queueTime = this.currentTimeMS - request.arrivedAtMS;
    if (queueTime < 0) {
      // Server was waiting for the request.
      this.currentTimeMS = request.arrivedAtMS;
    }

    // Process the request.
    this.currentTimeMS += request.processingTimeMS;
  }

  handleRequests(requests: DNSRequest[]) {
    for (const request of requests) {
      this.handleDNS(request);
    }
  }
}
