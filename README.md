## Network Course Project

Task list:

- DNS server and attack simulation.
- TypeScript implementation of RHHH.
- Implement own evolutionary algorithm for protecting a DNS server.
- Find real DNS data and integrate with the simulation.
- Website with descriptions and examples.

### DNS server and attack simulation

A basic skeleton is done, we can start working on algorithm implementations.
The following tasks are left:

- Add return values with metrics to `handleDNS` and `handleRequests` with metrics
  for plotting.
- Find real DNS trace dataset and import data into the script.

### RHHH implementation

We will implement RHHH inside `updateAndCheckIfHeavyHitter`.
The function will return if the current IP is of a heavy hitter subnet for it to
later be used in the protection algorithm implementation.

```ts
class RHHH {
  // ...

  // Returns true when the IP is of a heavy hitter subnet.
  updateAndCheckIfHeavyHitter(source: IPv4): boolean {
    // TODO Implement RHHH algorithm.
  }
}
```

### Own algorithm implementation

We will implement a protection algorithm based on RHHH return value in the `handleDNS` method.

```ts
class DNSServerSimulator {
  handleDNS(request: DNSRequest) {
    const isHeavyHitter = this.rhhh.updateAndCheckIfHeavyHitter(request.source);
    // TODO Use the value from RHHH to protect the server somehow.

    // ...
}
```

### Real DNS data

- https://www.caida.org/catalog/datasets/passive_dataset_download/
- https://www.unb.ca/cic/datasets/dns-2021.html

Submitted a request for CAIDA datasets 2019, 2018, 2016, 2015, 2014, 2013 at 13/08/2024 18:30.

Got access to the UNB dataset but it does not contain source IP addresses.

### Website

We will create a static site on GitHub Pages, using Astro or NextJS.
The simulation is written in TypeScript so it will be easy to use the module
inside a React (or even vanilla JS) website.

We can use React, Material UI and MUI X
[which includes chart components](https://mui.com/x/react-charts/lines/)
to easily design a small UI for setting parameters and displaying simulation results.
