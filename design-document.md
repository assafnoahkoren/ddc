### Brief explanation of your approach

First, I will divide the challenge to domains.

1. **Data-sources Integration**
   Create a service that will handle the integration authentication flow (We can also abstract common authentication flows like oauth so many integrations can be connected much more easily).
   Create another service that will expose an sdk per integration.
2. **Schema Discovery (creating physical schemas)**
3. **Mapping logical schemas to physical schemas**
4. **Querying the physycal data using logical schema syntax**
