import {
  useState,
  type ChangeEventHandler,
  type FunctionComponent,
} from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import Alert from "@mui/material/Alert";
import { LineChart } from "@mui/x-charts/LineChart";

interface Props {}

interface ChartData {
  attackBlockRate: number[];
  totalBlockRate: number[];
  timeSaveRate: number[];
  legitimateRateFromBlocked: number[];
  attackRateFromBlocked: number[];
}

export const Simulation: FunctionComponent<Props> = ({}) => {
  const [threshold, setThreshold] = useState(0.1);
  const [thresholdValid, setThresholdValid] = useState(true);

  const [legitimateSize, setLegitimateSize] = useState(50000);
  const [attackSize, setAttackSize] = useState(25000);

  const [chartData, setChartData] = useState<ChartData>({
    attackBlockRate: [],
    totalBlockRate: [],
    timeSaveRate: [],
    legitimateRateFromBlocked: [],
    attackRateFromBlocked: [],
  });

  const handleLegitimateSizeChange = (_: any, value: number | number[]) => {
    if (typeof value === "number") {
      setLegitimateSize(value);
    }
  };

  const handleAttackSizeChange = (_: any, value: number | number[]) => {
    if (typeof value === "number") {
      setAttackSize(value);
    }
  };

  const handleThreholdValidation: ChangeEventHandler<HTMLInputElement> = (
    e,
  ) => {
    if (!/\d+\.\d+/.test(e.target.value)) {
      setThresholdValid(false);
      return;
    }
    const value = parseFloat(e.target.value);
    if (isNaN(value)) {
      setThresholdValid(false);
      return;
    }
    setThresholdValid(true);
    setThreshold(value);
  };

  const handleSimulation = async () => {
    setChartData(await runSimulation(threshold, legitimateSize, attackSize));
  };

  const runHighSuccessRateExample = async () => {
    setChartData(await runSimulation(0.1, 20000, 10000));
  };

  const runHighLegitimateBlockExample = async () => {
    setChartData(await runSimulation(0.1, 20000, 2500));
  };

  const runSuccessfulButBlockingLegitimateExample = async () => {
    setChartData(await runSimulation(0.1, 20000, 3000));
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h4">Simulation</Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
          In this form you can modify simulation parameters and run a simulation
          of RHHH based evolutionary DNS server protection algorithm over up to
          210,000 requests.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Simulation results are displayed below the form. The charts' X axis is
          in thousands of requests. Run the simulation to display data, there is
          no data to display initially before running a simulation.
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Clicking "Run Simulation" may make the browser tab unresponsive while
          running the simulation. It will become responsive after the simulation
          is done running.
        </Alert>
        <Typography id="input-slider" gutterBottom>
          Legitimate requests count
        </Typography>
        <Slider
          defaultValue={50000}
          min={5000}
          max={110000}
          valueLabelDisplay="auto"
          onChange={handleLegitimateSizeChange}
        />
        <Typography id="input-slider" gutterBottom>
          Attack requests count
        </Typography>
        <Slider
          defaultValue={25000}
          min={1000}
          max={100000}
          valueLabelDisplay="auto"
          onChange={handleAttackSizeChange}
        />
        <TextField
          label="Threshold"
          defaultValue="0.1"
          fullWidth
          margin="normal"
          onChange={handleThreholdValidation}
          error={!thresholdValid}
        />
        <Button
          variant="contained"
          disabled={!thresholdValid}
          onClick={handleSimulation}
          sx={{ mt: 2 }}
        >
          Run Simulation
        </Button>
        <LineChart
          series={[
            {
              data: chartData.attackBlockRate,
              label: "% of attack requests blocked",
            },
          ]}
          height={300}
        />
        <LineChart
          series={[
            {
              data: chartData.totalBlockRate,
              label: "% blocked requests",
            },
            {
              data: chartData.timeSaveRate,
              label: "% CPU time saved",
            },
          ]}
          height={300}
        />
        <LineChart
          series={[
            {
              data: chartData.attackRateFromBlocked,
              label: "% attack from blocked requests",
            },
            {
              data: chartData.legitimateRateFromBlocked,
              label: "% legitimate from blocked requests",
            },
          ]}
          height={300}
        />
        <Typography variant="h4">Examples</Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
          Example showing high attack blogk rate with little to no legitimate
          traffic blocking. With 0.1 threshold, 20,000 legitimate requests and
          10,000 attack requests.
        </Typography>
        <Button variant="contained" onClick={runHighSuccessRateExample}>
          High success rate example
        </Button>
        <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
          Example showing high legitimate request block rate when the rate of
          attack requests is too low compared to the threshold. With 0.1
          threshold, 20,000 legitimate requests and 2,500 attack requests.
        </Typography>
        <Button variant="contained" onClick={runHighLegitimateBlockExample}>
          High legitimate block rate example
        </Button>
        <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
          Example showing mediocre blocking of an attack but also blocking of a
          lot of legitimate traffic when the rate of attack is close to the
          threshold. With 0.1 threshold, 20,000 legitimate requests and 3,500
          attack requests.
        </Typography>
        <Button
          variant="contained"
          onClick={runSuccessfulButBlockingLegitimateExample}
        >
          Mediocre blocking but also blocking legitimate traffic example
        </Button>
      </CardContent>
    </Card>
  );
};

async function runSimulation(
  thresold: number,
  legitimateCount: number,
  attackCount: number,
): Promise<ChartData> {
  const legitimateData = (await import("../content/legitimateTrace.json"))
    .default as DNSRequest[];
  const attackData = (await import("../content/attackTrace.json"))
    .default as DNSRequest[];

  const legitimateDataSliced = legitimateData.slice(0, legitimateCount);
  const lastLegitimateArrival =
    legitimateDataSliced[legitimateDataSliced.length - 1].arrivedAtMS;

  const attackDataSliced = attackData.slice(0, attackCount);
  const lastAttackArrival =
    attackDataSliced[attackDataSliced.length - 1].arrivedAtMS;

  const attackDataWithTimesNormalized = attackDataSliced.map((e) => ({
    ...e,
    arrivedAtMS: (e.arrivedAtMS * lastLegitimateArrival) / lastAttackArrival,
  }));
  const combinedData = legitimateDataSliced.concat(
    attackDataWithTimesNormalized,
  );
  combinedData.sort((a, b) => a.arrivedAtMS - b.arrivedAtMS);

  const dnsServer = new DNSServerSimulator(thresold);
  dnsServer.handleRequests(combinedData);

  const attackBlockRate = dnsServer.attackRequestsData
    .map(
      (attackRequests, i) =>
        dnsServer.attackRequestsBlockedData[i] / attackRequests,
    )
    .map((v) => (isNaN(v) ? 0 : v))
    .filter((_, i) => i % 1000 === 0)
    .map((v) => v * 100);
  const totalBlockRate = dnsServer.totalRequestsData
    .map(
      (totalRequests, i) =>
        dnsServer.totalRequestsBlockedData[i] / totalRequests,
    )
    .map((v) => (isNaN(v) ? 0 : v))
    .filter((_, i) => i % 1000 === 0)
    .map((v) => v * 100);
  const timeSaveRate = dnsServer.totalCPUTimeSavedData
    .map(
      (totalCPUTimeSaved, i) =>
        totalCPUTimeSaved / dnsServer.totalCPUTimeData[i],
    )
    .map((v) => (isNaN(v) ? 0 : v))
    .filter((_, i) => i % 1000 === 0)
    .map((v) => v * 100);
  const legitimateRateFromBlocked = dnsServer.legitimateRequestsBlockedData
    .map(
      (legitimateRequestsBlocked, i) =>
        legitimateRequestsBlocked / dnsServer.totalRequestsBlockedData[i],
    )
    .map((v) => (isNaN(v) ? 0 : v))
    .filter((_, i) => i % 1000 === 0)
    .map((v) => v * 100);
  const attackRateFromBlocked = dnsServer.attackRequestsBlockedData
    .map(
      (attackRequestsBlocked, i) =>
        attackRequestsBlocked / dnsServer.totalRequestsBlockedData[i],
    )
    .map((v) => (isNaN(v) ? 0 : v))
    .filter((_, i) => i % 1000 === 0)
    .map((v) => v * 100);
  return {
    attackBlockRate,
    totalBlockRate,
    timeSaveRate,
    legitimateRateFromBlocked,
    attackRateFromBlocked,
  };
}

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
  attackRequests: number;
  totalRequestsBlocked: number;
  attackRequestsBlocked: number;
  legitimateRequestsBlocked: number;
  totalCPUTime: number;
  totalCPUTimeUsed: number;
  totalCPUTimeSaved: number;

  totalRequestsData: number[];
  attackRequestsData: number[];
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
    this.attackRequests = 0;
    this.totalRequestsBlocked = 0;
    this.attackRequestsBlocked = 0;
    this.legitimateRequestsBlocked = 0;
    this.totalCPUTime = 0;
    this.totalCPUTimeUsed = 0;
    this.totalCPUTimeSaved = 0;

    this.totalRequestsData = [];
    this.attackRequestsData = [];
    this.totalRequestsBlockedData = [];
    this.attackRequestsBlockedData = [];
    this.legitimateRequestsBlockedData = [];
    this.totalCPUTimeData = [];
    this.totalCPUTimeUsedData = [];
    this.totalCPUTimeSavedData = [];
  }

  private pushCountersToData() {
    this.totalRequestsData.push(this.totalRequests);
    this.attackRequestsData.push(this.attackRequests);
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

    this.totalRequests++;
    if (request.isAttack) {
      this.attackRequests++;
    }

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
