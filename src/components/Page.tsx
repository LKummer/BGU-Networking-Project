import { Fragment, type FunctionComponent } from "react";
import { Simulation } from "./Simulation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

interface Props {}

export const Page: FunctionComponent<Props> = ({}) => {
  return (
    <Fragment>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h4">HHH Explanation</Typography>
          <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
            The hierarchical heavy hitters algorithm is a streaming algorithm
            designed to identify the most frequent request sources based on a
            prefix hierarchy. In a nutshell: The algorithm counts how many
            requests were received from different subnets, and identifies the
            most frequent request sources based on request frequency.
          </Typography>
          <Typography variant="body1">
            We chose the randomized hierarchical heavy hitters as we are running
            our simulation in slow environments. Since our simulation is running
            in the browser, it blocks UI rendering and is expected to run on
            average hardware. Anything reducing the already long run time is
            appreciated.
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h4">Simulation Explanation</Typography>
          <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
            We used a real DNS request trace from the CAIDA anonymized 2019
            internet trace. We extracted incoming DNS requests from the CAIDA
            data, making sure to filter out non-DNS related packets and outgoing
            DNS responses. We limited the simulation to under 200,000 requests
            because of browser and hosting limitations.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            We simulated an attack trace from a single /16 subnet to simulate a
            typical attack, and injected the attack requests into the trace.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            We implemented the RHHH algorithm in TypeScript and validated it
            works by manually checking it on a subset of the trace. We chose
            TypeScript because it runs natively in the browser allowing us to
            create this simulation website without needing to rent a server for
            a backend.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            We then implemented a DNS server simulation, and created a
            protection algorithm using the RHHH algorithm as a black box
            inspecting uncached requests, choosing a random prefix from the
            request's source IP, and using the RHHH algorithm to check if the
            prefix is a heavy hitter. You can run our DNS server simulation
            below.
          </Typography>
        </CardContent>
      </Card>
      <Simulation />
    </Fragment>
  );
};
