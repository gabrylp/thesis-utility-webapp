# of a System Integration Remotely Operated Surface Treading Water Sampling Robot for Microplastics Research 

Christian Andrie G. Asne[1] , Gabriel G. Potazo[1] , Ellery Von E. Salas[1] , Engr. Precious Julia Ablir[2] , Dr. Luis Gerardo S. Ca˜nete Jr.[3] 

> 1Undergraduate Student, Department of Computer Engineering, University of San Carlos, Cebu City, Philippines 

> 2Graduate Student, Department of Computer Engineering, University of San Carlos, Cebu City, Philippines 

> 3Faculty Member, Department of Computer Engineering, University of San Carlos, Cebu City, Philippines 23101546@usc.edu.ph, 23102800@usc.edu.ph, 23100559@usc.edu.ph, 25104850@usc.edu.ph, lscanete@usc.edu.ph 

_**Abstract**_ **—Microplastics, defined as plastic particles smaller than 5 mm, present increasing environmental and potential health concerns. However, reliable data collection remains challenging due to labor-intensive and inconsistent manual sampling methods. This study will propose a robotic system that will automate and standardize surface water sampling for microplastic monitoring. The system will integrate a catamaran hull for stability, a remotely operated navigation system using LoRa communication, and a dual-pump filtration module. A flow sensor will be utilized for validation to ensure accurate sampling volume. The proposed system will aim to improve safety, efficiency, and consistency in data collection, providing a scalable solution for environmental monitoring and microplastic research.** 

Fig. 1. Manual Sampling Process 

_**Index Terms**_ **—Microplastics, Water Sampling, Robotics, Catamaran Hull, LoRa Communication, Flow Sensor, Environmental Monitoring** 

## I. INTRODUCTION 

Microplastics are plastic particles smaller than 5 millimeters in size [2] and originate from two main sources: primary and secondary. Primary microplastics are intentionally manufactured small plastics such as microbeads and pellets, while secondary microplastics are formed from the breakdown of larger plastic materials over time. 

These particles pose environmental and potential health risks through processes known as bioaccumulation and biomagnification [3]. Bioaccumulation refers to the gradual buildup of harmful substances, such as microplastics, in the tissues of a living organism over time. Biomagnification, on the other hand, is the increasing concentration of these substances at higher levels of the food chain. Studies, including those from Stanford Medicine [4], have reported the presence of microplastics in various human organs and tissues such as the brain, heart, and stomach. This highlights the importance of continuous monitoring and research on microplastic pollution. 

At the University of San Carlos, the Department of Biology, led by Dr. Maria Kristina O. Paler, conducts microplastic research using a manual sampling process shown in Fig. 1. 

Fig. 2. Conventional Sampling Method 

This process begins with planning and preparation, where researchers identify sampling sites, secure permits, prepare materials such as dippers, sieves, and containers, and ensure safety through proper equipment. 

The next step involves traveling to the sampling location, which may require renting a boat costing approximately P 3,000– P 4,000, excluding fuel and operator fees. All equipment must be transported manually, increasing both effort and cost. 

During sampling, researchers must manually position themselves in water, continuously adjusting due to waves and currents, which introduces safety risks and may require swimming ability. Sampling is conducted using a convenient sampling method shown in Fig. 2, where water is manually poured using a dipper through a sieve. According to ISO 5667-27, collecting large volumes of water is important for reliable microplastic analysis. In practice, Dr. Maria Kristina O. Paler of the University of San Carlos recommends an ideal sampling volume of approximately 1000 liters to obtain sufficient data. 

1 

Fig. 3. Proposed Optimized Sampling Process 

However, with each dipper holding approximately 2 liters, achieving this would require around 500 repetitions. Due to physical limitations, researchers typically collect only around 200 dippers or approximately 400 liters. 

Finally, the process concludes with returning to shore, where researchers must carry wet and heavy equipment and safely transport collected samples, which may also be contaminated, further increasing effort and risk. 

Overall, the manual sampling process is labor-intensive, time-consuming, costly, unsafe, and prone to human error. 

From this manual sampling process, several inefficiencies and risks are evident, particularly in deployment, sample collection, and safety. These challenges highlight the need for improvements in how microplastic sampling is commonly conducted. One potential approach will be the use of a robotic system capable of performing the sampling process on the water surface. By reducing reliance on manual labor, such a system will improve safety, efficiency, and portability while supporting more consistent sampling practices, as illustrated in Fig. 3. 

Previous research conducted by student researchers from the Department of Computer Engineering introduced a water surface sampling robot as shown in Fig. 4 designed to improve the efficiency of microplastic collection. The study successfully demonstrated key subsystems, including a catamaran hull for stability, a pump-based sampling mechanism capable of achieving a sampling rate of approximately 1000 L/h, and a propulsion system that enabled omnidirectional movement. However, the initial prototype still encountered several technical and integration issues. These remaining issues indicate that, although the robotic approach is viable, the system still requires further refinement toward a system-integrated and operational microplastic sampling robot. 

Fig. 4. Overall Integration of Microplastic Sampling Robot 

- 3) The previous robotic prototype exhibited leakage issues, particularly in the pump compartment. 

- 4) The previous robotic prototype lacked full integration of critical subsystems, particularly the navigation module and onboard power system. 

- 5) Although several subsystems in the previous robotic prototype were functional, their performance and design can still be further optimized. 

- 6) Because of these limitations, the previous system was not yet fully operational or deployment-ready for field use. 

## III. GOALS AND OBJECTIVES 

This study aims to develop and integrate a remotely operated water-sampling robot. The specific objectives are as follows: 

- 1) Solve the leakage problem of the catamaran hull around the pump compartment. 

- 2) Implement the optimized Voith-Schneider Propeller (VSP). 

- 3) Validate the sampling module to achieve a flow rate of greater than or equal 1000 L/h and improve sampling performance using updated design data. 

- 4) Integrate a remote control system to enable wireless communication between the robot and the user. 

- 5) Achieve at least 1.5 hours of runtime using the selected battery setup and validated power distribution. 

- 6) Evaluate fully integrated system performance: stability, sampling performance, movement, communication, and endurance through controlled pool testing. 

## IV. SIGNIFICANCE OF THE STUDY 

## II. PROBLEM STATEMENT 

This study will aim to address the specific limitations of both the manual sampling process and the previously developed robotic system. The key problems identified in this study are as follows: 

- 1) The current manual sampling process is labor-intensive, time-consuming, and exposes researchers to safety risks during fieldwork. 

- 2) Manual sampling also results in inconsistent data collection and makes it difficult to achieve the recommended sampling volume. 

This study will contribute to the broader effort of improving environmental monitoring of microplastic pollution, with particular relevance to Philippine freshwater and coastal ecosystems. The following groups will stand to benefit from the outcomes of this research. 

_Marine biology and environmental science researchers._ The robot will directly address the volume and safety limitations of manual microplastic sampling. By enabling the collection of 1000L or more of surface water per hour, the system will allow researchers to gather statistically robust datasets without physical strain or exposure to open-water hazards. The 

2 

standardised, repeatable sampling procedure will also improve the comparability of data collected across different sites and time periods. 

_The University of San Carlos (USC) Biology Department._ As the primary end-user of the device, the USC Biology Department will gain a practical, portable, and remotely operated tool tailored to their microplastics research programme. The robot will reduce the logistical and physical burden of field sampling campaigns, enabling more frequent and more geographically diverse data collection across Cebuano water bodies. 

_Future engineering and robotics researchers._ This study will document the full design, prototyping, and testing cycle of a multi-subsystem embedded robotics project —encompassing hull design, VSP propulsion, pump-based filtration, wireless navigation, and onboard power systems. It may serve as a technical reference for future iterations or related autonomous surface vehicle (ASV) research. 

_The broader scientific and policy community._ Standardised robotic sampling tools will contribute to international efforts to monitor the distribution and concentration of microplastics in freshwater and marine environments. The datasets generated using this system will support the production of large-scale, comparable records needed to inform environmental policy and conservation decisions. 

## V. SCOPE AND LIMITATIONS 

This study focuses on the development, integration, and evaluation of a remotely operated robotic system for surfacewater microplastic sampling. 

## _Scope_ 

The scope of the study are as follows: 

- The study will not include actual field deployment in rivers, lakes, coastal waters, or marine environments. 

- Although the system will measure the volume of water collected, the study will not quantify or identify the actual amount of microplastics captured in the sampled water. 

- Power consumption and endurance values will be based on estimates and controlled tests, and may differ under real deployment conditions. 

- The researchers will not develop a new optimized VSP design. Instead, the study will adapt the existing design of Engr. Ablir in alignment with the objectives of the research. 

## VI. REVIEW OF RELATED LITERATURE 

This chapter will review related literature primarily on robotic surface-water sampling for microplastic research, with emphasis on existing sampling platforms and their major subsystems. It will discuss relevant studies on unmanned surface vehicles (USVs) and robot-based sampling systems, focusing on key design components such as hull configuration, propulsion, communication, sampling, and power systems. Finally, the chapter will identify research gaps in system integration and deployment that will serve as the basis for this study. 

- The study will develop, optimize, and integrate the robot’s subsystems, including hull, propulsion, sampling, control, communication, and onboard power. 

- The system will be designed specifically for surface-water sampling operations related to microplastic research. 

- The study will adapt and implement the optimized VoithSchneider Propeller (VSP) configuration based on the design work provided by Engr. Precious Julia Ablir. 

- The study will verify that the pump-based sampling subsystem can measure and deliver a target water volume of greater than or equal 1000 liters per hour. 

- Testing and validation will be conducted in a controlled pool environment. 

- The study will evaluate the integrated robot in terms of stability, maneuverability, sampling performance, communication, and operational endurance. 

## _Limitations_ 

The limitations of the study are as follows: 

- Because testing is limited to a controlled pool environment, the study will not fully account for real-world disturbances such as strong waves, currents, wind, debris, and varying water conditions. 

## _A. UAV-Based Remote Water Sampling System_ 

SPH Engineering [26] presented a UAV-based remote water sampling system designed to collect samples from hard-toreach or hazardous areas without requiring direct human access to the water body. The system integrates a drone platform, onboard control hardware, altitude sensing, and a remoterelease sampling mechanism to repeatedly collect water at a controlled location and depth. This study will be relevant to the present work because it demonstrates an alternative robotic approach to remote water sampling that improves operator safety and sampling consistency, even though it uses an aerial rather than a surface vehicle platform. Unlike that UAV-based system, the present study focuses on a surface-treading robot with pump-based continuous sampling, catamaran stability, and onboard propulsion that is better suited for sustained surface-water microplastics collection. 

3 

of a compact catamaran-based robotic platform in the present study for safer and more consistent surface-water sampling. However, unlike many of these USV studies, the present work specifically combines microplastic-oriented pump filtration, VSP-based omnidirectional maneuvering, and full subsystem integration into a single low-cost research platform. 

## _C. Jellyfishbot Pump-and-Filter Sampling Platform_ 

Fig. 5. UAV-Based Remote Water Sampling System 

## _B. USVs for Microplastic Sampling_ 

Unmanned Surface Vehicles (USVs) are increasingly used in environmental monitoring [9] due to their ability to collect data without direct human involvement. Originally developed for military applications, USVs are now widely applied in water quality monitoring, pollution tracking, and environmental data collection. These platforms improve spatial coverage, reduce human risk, and allow more consistent data acquisition compared to manual methods. Recent studies highlight the 

Pasquier et al. [12] presented the Jellyfishbot, a compact catamaran aquatic drone adapted for microplastic sampling in river and coastal waters. In a direct comparison with the conventional manta net, the Jellyfishbot produced comparable results in terms of microplastic abundance, shapes, and colours. The study further showed that its pump-and-filter sampling approach, which uses a fixed and measurable sampled volume, improves reproducibility and offers practical advantages in portability and access to narrow or hard-to-reach spaces. This makes the Jellyfishbot a distinct benchmark study for robotic surface-water sampling because it combines the accessibility of a small catamaran drone with the standardization benefits of controlled-volume filtration [12]. Unlike the Jellyfishbot, however, the present study emphasizes a custom-built VSPpropelled platform with integrated remote control, onboard power distribution, and subsystem optimization tailored to the project’s local deployment and testing requirements. 

Fig. 7. Jellyfishbot pump-and-filter sampling platform 

Fig. 6. Pamela Catamaran Drone 

integration of robotic platforms with microplastic sampling systems. For instance, Deschˆenes et al. [11] demonstrated the use of USVs equipped with imaging systems for detecting floating microplastics, improving sampling efficiency and reducing human bias. Other systems also utilize pump-based filtration integrated into small USVs, proving the feasibility of collecting microplastics using compact robotic platforms. The “Pamela” catamaran drone [22] further demonstrates the practicality of using twin-hull designs for environmental sampling, although it relies on net-based collection requiring forward motion. Taken together, these studies support the use 

## _D. Autonomous Surface Vehicle for Real-Time Monitoring of Water Bodies in Bangladesh_ 

Arko et al. [28] developed a small autonomous surface vehicle for water-body monitoring and water-sample collection in Bangladesh. The platform integrates GPS-guided navigation, onboard water-quality sensing, pump-based sample collection, and wireless data transmission, illustrating how a lightweight and rechargeable ASV can combine monitoring and sampling functions in a portable field system. This study is relevant to the present work because it demonstrates a parallel approach to automating surface-water data collection through a compact robotic platform with integrated sensing, navigation, and communication subsystems. In contrast, the present study is more specifically focused on microplastics sampling, pump-driven 

4 

## _F. Research Gap and Contribution_ 

Existing studies confirm that robotic systems for microplastic sampling are both feasible and beneficial [25]. However, several gaps remain. 

First, the integration of a miniaturized propulsion system such as the VSP with a stable and watertight hull has not been fully explored. Second, many existing systems rely on external power sources, limiting mobility. Third, accessible and lowcost implementations compared to existing alternatives which is suitable for local research environments remain limited. 

Fig. 8. Autonomous surface vehicle for water-body monitoring in Bangladesh 

filtration performance, and integrated propulsion control rather than general water-quality monitoring alone. 

## _E. Autonomous Microplastics-Collecting Semisubmersible_ 

Isahaku [30] proposed an autonomous microplasticscollecting semisubmersible based on a modified manta trawl, demonstrating how conventional net-based sampling can be adapted into a self-propelled robotic platform. The study described a design that integrates propulsion, onboard control electronics, and autonomous guidance, and it supported the prototype development with CAD-based design work, CFD analysis, and wave-flume testing. Through empirical validation, the work showed the feasibility of automating mantatrawl-style microplastic sampling for more standardized and repeatable field collection. This study builds upon the USV 

This study addresses these gaps by developing a fully integrated, battery-powered robotic sampling system that combines a catamaran hull, pump-based filtration, and wireless control. The system builds upon the first-iteration prototype by Alin et al. [1] by optimizing subsystem performance and completing missing components, particularly in navigation and power integration, resulting in an integrated platform for surface water microplastic sampling. In this way, the present study contributes a more application-specific combination of stability, sampling validation, remote operation, and propulsion integration than the broader literature has typically reported. 

## VII. METHODOLOGY 

This chapter will describe the systematic approach that will be taken to develop a system-integrated, remotely operated water sampling robot for microplastics research. The methodology will be organized according to the six objectives defined in Section III. 

## _A. Conceptual Framework_ 

Fig. 9. Autonomous microplastics-collecting semisubmersible 

paradigm established in these works but differentiates itself through full subsystem integration, onboard battery power, and omnidirectional VSP propulsion. Unlike net-based forwardmotion systems, the proposed platform is capable of stationkeeping sampling, which better accommodates confined or crowded water environments. Compared with the semisubmersible approach, the present study also prioritizes a surfaceoperating catamaran platform with easier remote supervision, integrated sampling-volume validation, and subsystem testing in a complete robotic setup. 

Fig. 10. Conceptual Framework 

The conceptual framework of this study will be grounded in iterative engineering development. The prior feasibility study 

5 

by Alin et al. [1] established that a robotic approach to microplastic surface-water sampling is viable, demonstrating a baseline sampling rate of 1000 L/h, dual mesh filtration, and omnidirectional movement. However, that study left three critical gaps: hull leakage, an unintegrated navigation module, and no onboard power system. 

against condensation, splash entry, or residual water during testing. Each item therefore supports a specific waterproofing requirement of the integrated robot. 

Fig. 11. Success-Criterion Cycle 

The present study takes these gaps as inputs and addresses each through a structured subsystem development cycle: (1) diagnose the problem, (2) design and implement a solution, (3) test against a defined success criterion, and (4) iterate if the criterion is not met. 

Following the conceptual framework, the methodology is organized by subsystem. Each subsection presents the previousiteration status, the justification for the selected device or component, the planned integration work, and the validation procedure. This structure explains what will be implemented, how it will be tested, and why each component is retained, modified, or added for the current system integration. 

## _B. Catamaran Hull: Leakage Prevention in the Pump Compartment_ 

The catamaran hull is retained because the previous iteration confirmed its suitability for surface-water sampling. Stability and displacement tests showed lower roll, improved movement, and better stationary stability than the alternative hull design. The demihulls were fabricated from polylactic acid (PLA), which was recommended by the resource speaker because of its biodegradable properties, and were waterproofed with epoxy primer and enamel coating based on earlier research and tests. Therefore, this study keeps the validated catamaran form as the integration platform and focuses on correcting the remaining pump-compartment leakage. 

The selected leakage-prevention items address specific failure paths in the integrated hull. Rubber gaskets provide compressible seals around through-hull fittings, especially at pump inlet and outlet penetrations where rigid printed or coated surfaces may not mate perfectly. Marine epoxy bonds and seals internal joints, fastener points, and small gaps that gaskets alone cannot cover. Electronic components will also be raised at least 10 mm above the waterline as secondary protection 

Fig. 12. Compartment Leakage Location 

The first-iteration prototype exhibited water ingress through the pump inlet and outlet penetrations, likely due to improper sealing. To sustain a target operational endurance of 1.5 hours without sinking, three complementary leaking prevention methods will be applied: 

- 1) **Rubber gaskets** fitted around all through-hull fittings. 

- 2) **Marine epoxy** (two-part, waterproof) applied to all internal joints and fastener penetrations. 

- 3) **Elevation of electronic components** above the waterline using raised mounting platforms (10 mm minimum clearance). 

_1) Leak Testing Protocol:_ Leak testing will be divided into three conditions to identify the most probable source of water ingress before further design changes are made. The static test isolates the effectiveness of the passive seals, the pump-running test checks whether pump operation introduces additional leakage, and the wave-disturbance test determines whether unstable surface conditions affect the sealed compartments. Comparing the results across these phases will help determine whether leakage is caused by seal failure, pump-induced vibration or pressure changes, or external water disturbance. 

- 1) **Static test (pump off):** The robot will be placed on the pool’s water surface with the pump turned off to determine whether water ingress occurs under normal floating conditions. This test verifies whether the sealant, gaskets, and hull penetrations are sufficient without active pumping or external disturbance. Water accumulation will be measured every 6 minutes over a 1 hour period across ten trials. If leakage occurs during this phase, corrective action will focus on improving the sealing of compartment openings and joints. The system 

6 

   - passes this test if no submersion occurs throughout the trial duration. 

- 2) **Dynamic test (pump running):** The same procedure will be repeated with the pump operating continuously to determine whether leakage is introduced or worsened during system operation. This test identifies leak paths caused by pump vibration, internal pressure changes, or movement in the hoses and mounted components. Results will be compared with the static test outcomes. If the robot passes the static test but leaks during this phase, the leakage is likely related to pump-induced effects rather than passive sealing alone. 

- 3) **Wave-disturbance test (electronics loaded):** The electronics-loaded robot will be exposed to simulated wave conditions to determine whether external disturbances contribute to leakage. This test evaluates whether rolling motion, repeated water impact, or disturbance around the hull openings compromises the pump compartment seals under less stable operating conditions. Results will be compared with the static and pumprunning tests to determine whether leakage is caused by passive sealing, pump operation, or environmental disturbance. 

_2) Stability Assessment:_ Stability will be assessed with the fully integrated robot, including the hull, propulsion units, pump-and-filtration assembly, controller receiver, and selected batteries in their intended positions. This test verifies whether the complete mass distribution remains stable during operation, not merely whether the bare catamaran hull floats. In the controlled pool, the robot will be exposed to manually generated waves produced with an empty 1-gallon water container moved to a metronome rhythm, giving each trial a repeatable disturbance pattern. Wave height will be checked using a ruler or marked pool-wall reference, and the disturbance level will be recorded before each run. Roll response, visible pitching, water entry, component shifting, and recovery behavior will be documented using video recordings and observation sheets. The integrated system passes if it remains upright, avoids submersion and unsafe component displacement, and remains controllable after the wave disturbance. The roll standard deviation will also be compared with the previous monohull baseline of 13 _._ 10 _[◦]_ reported by Alin et al. [1]. 

## TABLE I 

ROLL-ANGLE COMPARISON BETWEEN MONOHULL AND CATAMARAN HULLS FROM PREVIOUS ITERATION 

|**Metric**|**Monohull**|**Catamaran**|
|---|---|---|
|Peak Positive Roll Angle (_◦_)|25.76|14.76|
|Peak Negative Roll Angle (_◦_)<br>Average Positive Roll Angle (_◦_)<br>Average Negative Roll Angle (_◦_)|-40.27<br>8.67<br>-11.96|-9.58<br>3.32<br>-2.86|
|Mean Roll Angle (_◦_)|-4.32|0.89|
|Standard Deviation of Roll Angle (_◦_)|13.10|3.88|



Fig. 13. Axes of Rotation 

Fig. 14. Roll Angle over Time from Previous Iteration 

## _C. Movement Module: Implementation of the Optimised VoithSchneider Propeller_ 

The movement module builds on the propulsion tests completed in the previous iteration. The thrusters produced approximately 0.9927 N of thrust for open-water movement, but their directional flexibility was limited. The previous Voith-Schneider Propeller (VSP) configuration, which used NACA0016 fins, a 1:4 gear ratio, protruding metal shafts, and integrated bearings, produced approximately 0.9859 N of thrust. This was comparable to the thruster result while adding omnidirectional maneuverability. Because the assistant adviser identified opportunities to improve mechanical reliability, reduce water exposure, and strengthen station-keeping performance, the current study implements an optimized VSP. Initial integration tests also showed that the loaded hull could move forward, backward, diagonally, and in place, which supports position recovery after wave displacement. 

The optimized VSP is selected because the robot requires 

7 

slow, precise maneuvering during surface-water sampling. It must hold position, correct drift, and turn without relying on large forward movements. Compared with a thruster-only layout, the VSP can redirect thrust for station-keeping and closerange positioning. Since the previous VSP produced thrust comparable to the thrusters, this study retains the VSP concept and applies Engr. Precious Julia Ablir’s optimized design to address durability and water-exposure concerns. The selected components therefore support the required maneuverability while building on validated previous results. 

This study implements the optimized VSP design developed by Engr. Precious Julia Ablir for integration into the current robot. The previous design used shorter fins and exposed gears, which increased the risk of water entering the rotating mechanism. Although its thrust was comparable to the thrusters, the design was revised to improve protection, mechanical robustness, and overall performance. The current version uses an actuator rather than a servo to provide more suitable force output for the propulsion mechanism. The improved design features: 

The present study retains the dual-pump, dual-mesh filtration approach because it already meets the target sampling rate and supports a broad particle-size range. The two mesh sizes divide filtration between coarse and fine particles, reducing the load on either layer. The pump shroud is also retained to limit clogging and protect the cartridges from larger fragments during extended operation. Since flow rate may change after hose routing, outlet geometry, battery supply, and robot layout are integrated, the current work focuses on validation and limited optimization of the complete sampling module. 

Alin et al. [1] reported a flow rate of 1,242 L/h. Recent tests by Engr. Ablir achieved 1,500 L/h through two hose configuration changes: 

   - 1) **Inlet hose curvature:** The original 90 _[◦]_ bend is replaced with a smoother, larger-radius curve to reduce frictional head losses. 

- Longer fins that elevate the rotating mechanism above the waterline. 

- Actuator-based VSP control instead of servo-based control for improved mechanical strength during movement. 

**==> picture [231 x 17] intentionally omitted <==**

**----- Start of picture text -----**<br>
(a) Previous hose (b) Optimised hose curvature<br>curvature<br>**----- End of picture text -----**<br>


Fig. 16. Comparison of the previous and optimised inlet hose curvature designs. 

(a) Previous VSP design (b) Optimised VSP design Fig. 15. Comparison of the previous and optimised Voith-Schneider Propeller designs. 

- 2) **Outlet configuration:** The previous Y-junction is replaced with dual direct outputs to the filtration system, reducing head losses caused by flow convergence from the previous Y junction design. 

Its omnidirectional capability will be verified by executing forward/backward translation, lateral movement, in-place yaw, and diagonal station-keeping in a 3 _×_ 2 _×_ 1 m pool. Each maneuver is repeated five times; success is achieved if the robot responds within 1 second of joystick input. 

## _D. Sampling Module: Sampling Rate Validation and Optimisation_ 

The sampling module builds on the previous dual-pump, dual-mesh filtration design, which demonstrated effective microplastic capture and sufficient flow performance. Earlier tests confirmed that the 300 µm and 30 µm meshes work as complementary stages: the 300 µm mesh captures larger debris and particles, while the 30 µm mesh retains smaller particles for finer filtration. The pump pre-filtration shroud also served as a first-stage barrier by preventing larger fragments from entering the module. Functionality tests with water mixed with plastic fragments showed that both mesh layers captured particles, and the dual-pump configuration achieved 1,242 L/h, exceeding the 1,000 L/h target. 

(a) Previous outlet configuration (b) Optimised outlet configuration 

Fig. 17. Comparison of the previous and optimised outlet configuration designs. 

_1) Validation Procedure:_ A YF-S201 Hall-effect flow sensor will be installed at the pump outlet during validation only; it will be removed before field deployment to conserve battery power. Each pump will undergo three trials of 1 minute each under two conditions: 

- **Condition A:** Original hose configuration (baseline, targeting confirmation of 1,242 L/h). 

- **Condition B:** Optimised hose configuration (larger- radius inlet + dual direct outlets, targeting _≥_ 1,500 L/h). 

8 

The controller panels contain the primary operational controls: 

- (A) **SX1278 LoRa 433 MHz Whip Antenna:** An external antenna for the controller-side LoRa module to support wireless communication with the robot. 

- (B) **TM1637 4-Digit 7-Segment Display:** A two-wire (CLK/DIO) display module for real-time runtime monitoring, showing elapsed operation time in MM:SS format. The display will also show received signal strength indication (RSSI) levels: S0 for no signal, S1 for a weak signal, S2 for a moderate signal, and S3 for a strong signal. 

Fig. 18. Flowrate Consistency Validation Flowchart 

Flow rate (L/h) is recorded every minute. The system passes validation if the mean flow rate under Condition B is _≥_ 1 _,_ 500 L/h with a coefficient of variation below 5%. If this threshold is not met, the hose geometry (length, diameter, bend radius) will be iteratively refined and retested in parallel with Engr. Ablir’s findings. 

- (C) **KY-023 Joystick Module:** A joystick-based control input used for maneuvering the robot and requesting RSSI, with the left joystick assigned to propulsion control and the right joystick assigned to one-axis leftright turning control. Because the right joystick’s y-axis is not used for movement, it will be assigned to request the communication signal-strength display. 

- (D) **SHOPO Toggle Switch (Pump):** A toggle switch for turning the pump on and off during sampling operations. 

The back panel contains the main power switch: 

   - (E) **KCD1 Rocker Switch (Power):** A dedicated switch for powering the entire controller unit on and off. 

- _E. Navigation Module: Remote Control System Integration_ 

The navigation module addresses a key limitation of the previous iteration: although the hull, sampling, and movement subsystems were promising, remote navigation and communication were not fully integrated. Because researchers must operate the robot from shore or another safe location, the navigation module must allow movement and pump commands without requiring the operator to enter the water. This supports the study’s safety objective and allows the robot to be tested as an integrated remote surface-water sampling platform rather than as separate subsystems. 

The SX1278 LoRa module is selected for long-range, lowpower direct line-of-sight communication over open water, matching the 100–300 m target range for prototype testing. The Arduino Nano is used in the handheld controller because it is compact yet sufficient for reading joystick and switch inputs, driving the display, and sending command packets. The Arduino Uno is used on the robot side because it provides enough input/output capacity for command reception and subsystem control. The TM1637 display provides a low-power readout for runtime and signal-strength status, while the KY023 joystick and switches provide direct, low-cost manual controls suitable for controlled pool testing. 

A wireless remote control system will be implemented to enable shore-based operation of the robot without requiring the operator to enter the water. The controller is divided into a front panel and a rear panel. 

Fig. 19. Front View of the Controller Design (Subject to Change) 

The wireless link is established using two **SX1278 LoRa Ra-02 433 MHz** modules with whip antennas. The controllerside module functions as the transmitter and is connected to an **Arduino Nano** , which is suitable for the compact handheld controller. The robot-side module functions as the receiver and is connected to an **Arduino Uno** , which provides sufficient GPIO pins for the onboard subsystems and was already used in the previous iteration’s preliminary breadboard-based LoRa tests. The 433 MHz frequency band is suitable for the target 100–300 m line-of-sight operating range over open water. 

9 

robot is intended for low-speed surface-water sampling, with an estimated operating speed of about 0.5 m/s, rather than high-speed or precision maneuvering. A response within one second is sufficient for an operator to observe the robot’s motion and correct its heading during controlled pool testing. 

- 3) **Functionality:** Each control element must operate as intended, including smooth joystick response, accurate timer display in MM:SS format, and reliable pump switching. 

- _F. Control Module: Power System Sizing and Battery Selection_ 

**==> picture [218 x 8] intentionally omitted <==**

**----- Start of picture text -----**<br>
Fig. 20. Back View of the Controller Design (Subject to Change)<br>**----- End of picture text -----**<br>


The controller’s electromechanical input and output devices were selected for commercial availability, Arduino compatibility, and suitability for remote robot operation. These criteria keep the controller practical, reproducible, and maintainable during prototyping. Any component that fails to meet performance or functional requirements during testing will be replaced with a more suitable alternative. 

For signal-strength monitoring, the controller will use packet data from the SX1278 LoRa module, particularly RSSI and packet-reception status. The unused up–down axis of the right joystick will control this indicator: moving the joystick upward will show the current communication strength on the TM1637 display, while moving it downward will return the display to the normal runtime view. This preserves the controller layout while giving the operator a simple way to check link quality during line-of-sight testing. 

_1) Performance Evaluation:_ The control system will be evaluated on three metrics: 

- 1) **Range:** The controller will be tested at 100 m, 200 m, and 300 m while the robot floats on the water surface. At each distance, the joystick and pump switch will be checked for reliable operation. Success is defined as consistent control at _≥_ 100 m. The 100 m baseline is based on the current manual sampling practice of Dr. Paler and the biology researchers, who typically collect microplastic samples about 10–20 m from the shoreline to limit open-water exposure. Reliable control at 100 m would expand the reachable sampling area while keeping the robot within direct line of sight. The 200 m and 300 m distances then test additional range margins for locations that are difficult or unsafe to reach manually. 

- 2) **Latency:** The response time between controller input and robot actuation will be measured at 100 m, 200 m, and 300 m. The acceptable threshold remains **to be determined (TBD)** , with a provisional target of _≤_ 1000 ms. This provisional limit was selected because the 

The control module covers the electrical integration required for the robot to operate as a single system. In the previous iteration, the hull, sampling, and movement subsystems were feasible, but onboard power and final control integration were incomplete. Therefore, this study must size the batteries, assign loads to appropriate distribution paths, and verify that the control electronics, communication devices, pumps, and propulsion components can operate simultaneously for the required mission duration. 

The selected battery setup satisfies both runtime and layout requirements. Two 3S LiPo batteries rated at 9000 mAh are assigned to the robot, with one battery in each hull to improve weight balance and shorten high-current wiring runs. The 3S LiPo voltage supports the pump and propulsion loads while allowing regulated branches for lower-voltage electronics. A separate two-cell 7.4 V lithium-ion battery is used for the handheld controller because its lower current demand can be met with a compact, lightweight source for the Arduino Nano, LoRa transmitter, TM1637 display, joystick, and switches. This arrangement meets the 1.5-hour runtime requirement while separating high-current onboard loads from low-current controller electronics. 

Battery sizing was determined from the measured or rated current demand of the propulsion, sampling, control, and communication subsystems, then converted into minimum capacity requirements for the robot and the handheld controller. In the updated design, the power subsystem must support a total mission time of 1.5 hours, consisting of 1 hour of sampling and an additional 0.5 hours for navigation, deployment, and return. Because the platform uses a dual-hull layout, the main system power supply is distributed across two batteries to improve weight balance and electrical reliability. 

For the handheld controller, the total current draw is estimated at 0 _._ 102 A. For a minimum runtime of 1.5 hours, the base capacity requirement is therefore 0 _._ 153 Ah. Applying a 50% design margin increases the minimum required capacity to 0 _._ 230 Ah. At a nominal controller voltage of 7 _._ 4 V, this corresponds to an energy demand of approximately 1 _._ 702 Wh. Using the estimated discharge current, the base C-rating is approximately 0 _._ 44 C; with a design margin of two, the practical minimum C-rating is 0 _._ 88 C. 

The controller power source was compared across lithiumion, NiMH, and alkaline chemistries, with emphasis on energy density, compactness, and handheld usability. Using the 

10 

TABLE II 

CONTROLLER BATTERY SELECTION TABLE 

|**Battery Type**|**Energy**<br>**Density**|**Volume for**<br>**1.702 Wh**|**Specifc**<br>**Energy**|**Mass for**<br>**1.702 Wh**|
|---|---|---|---|---|
|Lithium-Ion|300|5.67 mL|150|11.35 g|
|Nickel Metal Hydride<br>Alkaline|170<br>275|10.01 mL<br>6.19 mL|60<br>35|28.37 g<br>48.63 g|



updated energy target of 1 _._ 702 Wh, lithium-ion remains the most favorable option because it provides the smallest volume and lowest mass among the compared chemistries. Among the considered lithium-ion options, a two-cell 3.7 V series configuration rated at 2500 mAh and 35 C was selected because it substantially exceeds the minimum capacity requirement while preserving a compact controller form factor. 

For the robotic platform, the estimated subsystem current draws are 0 _._ 025 A for control, 0 _._ 050 A for navigation, 4 _._ 600 A for the two VSP propulsion units, and 3 _._ 000 A for the two pumps, for a total current draw of 7 _._ 675 A. For 1.5 hours of operation, the base capacity requirement is therefore 11 _._ 513 Ah. Applying the same 50% design margin yields a required total capacity of 17 _._ 270 Ah. When divided across the dual-hull configuration, each hull battery must therefore provide at least 8 _._ 635 Ah. At a nominal system voltage of 12 _._ 6 V, this corresponds to approximately 108 _._ 801 Wh per battery. The per-hull current draw is 3 _._ 8375 A, giving a base C-rating of approximately 0 _._ 44 C. With a design margin of two, the practical minimum battery C-rating is 0 _._ 88 C. 

## TABLE III 

mately 17 _._ 270 Ah. 

- Handheld controller: one battery with capacity _≥_ 0 _._ 230 Ah. 

The preferred battery setup separates onboard power from controller power. The robotic platform will use two 3S LiPo batteries rated at 9000 mAh, with one battery installed in each hull to balance weight and shorten high-current wiring runs. Each hull battery will feed a local power-distribution path through a main switch and protective fuse before supplying the pump and propulsion load assigned to that hull. A regulated low-voltage branch will supply the Arduino Uno, LoRa receiver, flow sensor, and other logic-level electronics. The controller will use a separate two-cell 7.4 V lithiumion battery rated at 2500 mAh and 35 C for the Arduino Nano, SX1278 LoRa transmitter, TM1637 display, joystick, and switches. High-current pump and propulsion wiring will be routed separately from communication and sensor wiring, with proper grounding at the control electronics to reduce electrical noise and brownout risk. 

Battery adequacy will be validated during integrated testing by operating the robot and controller under normal load conditions and observing whether stable operation is maintained for the intended test duration without unexpected shutdown, communication loss, or voltage instability. 

In addition to runtime validation, the integrated power system will be checked for voltage sag and reset susceptibility during high-load events. In particular, when the pumps and VSP units start simultaneously, the supply voltage must remain above the minimum operating voltage of the microcontrollers to prevent brownout resets. These checks will be performed during full-load tests using voltage measurement instrumentation. 

SYSTEM BATTERY SELECTION TABLE 

## _G. Power Distribution Schematic_ 

|**Battery Type**|**Energy**<br>**Density**|**Volume for**<br>**108.801 Wh**|**Specifc**<br>**Energy**|**Mass for**<br>**108.801 Wh**|
|---|---|---|---|---|
|Lithium Polymer|300|0.363 L|150|0.725 kg|
|Nickel Metal Hydride<br>Lead-acid|170<br>90|0.640 L<br>1.209 L|60<br>35|1.813 kg<br>3.109 kg|



For the main system battery, lithium polymer (LiPo), NiMH, and lead-acid batteries were compared in terms of energy density, volume, and mass using the updated per-battery energy target of 108 _._ 801 Wh. LiPo was selected because it offers the most favorable weight-to-energy ratio and occupies the least volume within the hull. Among the candidate LiPo packs, a 3S LiPo battery rated at 9000 mAh was selected because it exceeds the per-hull capacity requirement of 8 _._ 635 Ah, provides ample current headroom for pump and propulsion surge loads, and remains significantly lighter and more compact than the alternative chemistries. Two such batteries, one installed in each hull, are used as the main onboard energy source. 

Accordingly, the power subsystem design adopts the following minimum battery specifications: 

- Robotic platform: two batteries, each with capacity _≥_ 8 _._ 635 Ah, for a combined required capacity of approxi- 

Figure 21 shows the power distribution circuit for the boat, while Fig. 22 shows the power distribution circuit for the handheld controller. In the boat schematic, Hull 1 and Hull 2 each use an independent 3S LiPo source labelled 11.1 V. The two hull batteries are not connected directly in series or in parallel at the battery terminals. Instead, each hull supply first passes through a 10 A fuse and a single-pole single-throw main switch. This allows each hull to be isolated independently, while the fuse provides short-circuit protection for the loads connected after the switch. 

After the switch, each hull supply feeds its local 12 V load branch. In the simplified schematic, Hull 1 powers MOTOR1 and VSP1, while Hull 2 powers MOTOR2 and VSP2. These labels represent the main high-current actuation loads assigned to each hull. The switched positive rails from both hulls are also routed toward the payload space through isolation diodes D1 and D2. These diodes prevent one hull battery from directly back-feeding the other hull battery while still allowing either hull supply to feed the control-power path. 

Inside the payload space, the diode-combined supply enters a 7805 voltage regulator, which provides a regulated 5 V rail for the Arduino Uno. The 5 V rail is then stepped down 

11 

through a 7833 regulator to provide the 3.3 V rail required by the LoRa module. The Arduino Uno and LoRa module share a common ground with the regulated supply. In this way, the schematic separates the high-current hull loads from the lower-voltage control and communication electronics while allowing either hull supply to maintain payload-side control power through the diode-isolated input. 

and transmitted wirelessly through the communication module to the receiver on the robotic platform. 

On the robot side, the onboard microcontroller receives the command packets and converts them into subsystem control outputs. Movement commands are translated into VSP control signals, while sampling commands activate the pumpcontrol path. During validation testing, the flow sensor returns sampling-rate feedback to the onboard controller so that the actual water throughput can be checked against the target requirement. The control-signal diagram is intentionally kept at the block-diagram level because the proposal focuses on system integration rather than a final pin-by-pin wiring layout. 

Fig. 21. Boat power distribution schematic 

The handheld controller circuit in Fig. 22 is a simplified controller power-input schematic. The controller supply enters through a 1 A fuse and a single-pole single-throw master switch before reaching the Arduino Nano supply input. The fuse limits fault current if a short circuit occurs after the supply input, while the switch allows the controller to be completely powered on or off. The schematic also includes two decoupling capacitors: C1 is a 100 _µ_ F bulk capacitor used to smooth larger supply dips, and C2 is a 10 _µ_ F local capacitor used to filter noise near the Arduino Nano input. The Arduino Nano then serves as the controller-side processing unit for the transmitter, joystick, display, and pump-command input used in the remote-control system. 

Fig. 23. Proposed control signal flow for the integrated robotic platform 

## _I. Integrated Pool Testing_ 

All subsystems will be installed on the catamaran platform and evaluated in a controlled laboratory pool (3 _×_ 2 _×_ 1 m). Objective 6 will be addressed through an integrated pool test that combines propulsion, sampling, wireless control, battery endurance, leakage monitoring, and stability assessment under repeatable manual wave disturbances. The simulated waves will be generated with an empty 1-gallon water container moved back and forth to a metronome beat, keeping the disturbance frequency consistent across trials. Wave height will be estimated using a ruler or marked pool-wall reference and recorded before response data are collected. Data collection will include elapsed runtime, battery voltage before and after testing, pump status, flow-rate readings, communication response, visible roll and pitch behavior, water-ingress inspection, and video documentation during wave exposure. Table IV summarizes the success criteria. 

TABLE IV 

Fig. 22. Handheld controller power distribution schematic 

## _H. Control Signal Flow_ 

Figure 23 presents the proposed control-signal flow for the integrated robotic platform. Operator inputs begin at the handheld controller, where the joystick provides directional commands and the pump switch provides the sampling command. These inputs are processed by the controller microcontroller 

PERFORMANCE METRICS AND SUCCESS CRITERIA 

|**Metric**|**Success Criterion**|
|---|---|
|Leakage|No submersion after 1.5 h operation|
|Sampling rate|_≥_1_,_000 L/h (flow sensor validated)|
|Remote control|Operable from _≥_100 m|
|Latency|_≤_100 ms (or TBD after pilot tests)|
|Endurance|_≥_1_._5 h on a single battery charge|



The integrated test will follow this protocol: 

12 

- 1) Install all batteries, electronics, pumps, filters, propulsion units, and the LoRa receiver in their final integrated positions. 

- 2) Record initial battery voltage, controller status, pump status, and communication response before the robot enters the water. 

- 3) Place the robot in the pool and confirm static floatation, trim, and absence of immediate water ingress. 

- 4) Start the metronome-guided manual wave simulation using the 1-gallon water container and record the observed wave-height range for the trial. 

- 5) Initiate the sampling sequence through the LoRa RF controller while maintaining direct line of sight to the robot. 

- 6) Operate the robot for a minimum of 1.5 hours, including navigation, station-keeping, and pump operation, while recording flow rate, response behavior, voltage readings, signal-strength indication, and stability observations. 

- 7) Return the robot to the launch point, stop the pump, inspect the hull interior for water ingress, and record final battery voltage and component condition. 

The full test will be repeated three times. The system will be considered **successfully integrated** if all success criteria in Table IV are met in at least two of the three trials. 

## _J. Expected Deliverables_ 

The study is expected to produce a set of concrete project deliverables that correspond directly to the stated design objectives. These deliverables define the intended outputs of the project in manuscript form rather than as a projectmanagement checklist. 

Table V summarizes the primary outputs expected from the study and shows how each deliverable corresponds to the stated project objectives. 

## TABLE V 

EXPECTED PROJECT DELIVERABLES AND CORRESPONDING OBJECTIVES 

|**Deliverable**|**Deliverable**|**Corresponding Objective**|
|---|---|---|
|1.|Optimized Catamaran Hull|1. Solve the leakage problem<br>of the catamaran hull|
|2.<br>Implemented<br>Optimized<br>Voith<br>Schneider<br>Propeller||2. Implement the optimized<br>Voith<br>Schneider<br>Propeller|
|(VSP)||(VSP)|
|3.|Validated Sampling Module|3. Validate the sampling mod-<br>ule to achieve_≥_1000 L/h fow<br>rate and possibly optimize it|
|4.|Integrated Control System|4. Integrate a remote control|
|||system for wireless communi-|
|||cation between the robot and|
|||the user|
|5.|Power Distribution System|5. Achieve at least 1.5 hours of<br>runtime using the selected bat-<br>tery setup and validated power|
|||distribution|
|6.|Field Test Validation Report|6.<br>Evaluate<br>system<br>perfor-<br>mance via controlled pool test-<br>ing|



The expected deliverables of the study are summarised as follows: 

- 1) **Optimized Catamaran Hull:** The leakage problem has been solved. 

- 2) **Implemented Optimized Voith Schneider Propeller (VSP):** The propulsion subsystem has been implemented for omnidirectional maneuvering. 

- 3) **Validated Sampling Module:** A dual-pump filtration system validated to collect _≥_ 1000 liters of water per hour. 

- 4) **Integrated Control System:** A remote controller with an operational range sufficient to control the robot without the researcher entering the water. 

- 5) **Power Distribution System:** An integrated electrical system that uses the selected batteries and distribution paths to achieve at least 1.5 hours of runtime during sampling, navigation, and control operations. 

- 6) **Field Test Validation Report:** Results from controlled pool tests by December 2026. 

## REFERENCES 

- [1] H. H. B. Alin, L. A. B. Camasura, and J. G. D. Ceballos, “Development of a Water Surface Treading Robot for the Sampling of Microplastics on Bodies of Water,” Undergraduate Thesis, B.S. in Computer Engineering, University of San Carlos, Cebu City, Philippines, Dec. 2024. 

- [2] M. Enfrin, L. F. Dum´ee, and J. Lee, “Nano/microplastics in water and wastewater treatment processes—Origin, impact and potential solutions,” _Water Research_ , vol. 161, pp. 621–638, 2019. 

- [3] M. E. Miller, M. Hamann, and F. J. Kroon, “Bioaccumulation and biomagnification of microplastics in marine organisms: A review and meta-analysis of current data,” _PLoS One_ , vol. 15, no. 10, p. e0240792, Oct. 2020, doi: 10.1371/journal.pone.0240792. 

- [4] Stanford Medicine News Center, “Microplastics and our health: What the science says,” Oct. 2, 2025. [Online]. Available: https://med.stanford.edu/news/insights/2025/01/microplastics-in-bodypolluted-tiny-plastic-fragments.html 

- [5] F. Stock, C. Kochleus, B. B¨ansch-Baltruschat, N. Brennholt, and G. Reifferscheid, “Sampling techniques and preparation methods for microplastic analyses in the aquatic environment—a review,” _TrAC Trends in Analytical Chemistry_ , vol. 113, pp. 84–92, 2019, doi: 10.1016/j.trac.2019.01.014. 

- [6] M. Kooi and A. A. Koelmans, “Simplifying microplastic via continuous probability distributions for size, shape, and density,” _Environmental Science & Technology Letters_ , vol. 6, no. 9, pp. 551–557, 2019. 

- [7] J. Masura, J. Baker, G. Foster, and C. Arthur, _Laboratory Methods for the Analysis of Microplastics in the Marine Environment: Recommendations for Quantifying Synthetic Particles in Waters and Sediments_ , NOAA Marine Debris Program, 2015. 

- [8] M. B. Zobkov and E. E. Esiukova, “Microplastics in a marine environment: Review of methods for sampling, processing, and analyzing,” _Water Resources_ , vol. 48, no. 4, pp. 595–608, 2021. 

- [9] Y. Liu and H. Zheng, “Unmanned Surface Vehicles (USVs): Methods, practices, and applications in environmental monitoring,” _Journal of Field Robotics_ , vol. 42, no. 1, pp. 89–115, 2025. 

- [10] H. A. Kusuma, M. F. Hanafi, T. Suhendra, and N. Oktaviani, “Testing the Range and Analysis of WSN LoRa Sx1278 Parameters in Coastal Areas,” _TELKA - Telekomunikasi Elektronika Komputasi dan Kontrol_ , vol. 10, no. 2, pp. 168–177, Jul. 2024, doi: 10.15575/telka.v10n2.168177. 

- [11] J.-S. Deschˆenes, M. Fraser, and L. Tremblay, “Uncrewed surface vehicle combined with near infrared hyperspectral imaging for sampling and analysis of aquatic microplastics,” _Marine Pollution Bulletin_ , vol. 198, p. 115890, 2024. 

- [12] G. Pasquier, P. Doyen, N. Carlesi, and R. Amara, “An innovative approach for microplastic sampling in all surface water bodies using an aquatic drone, _Heliyon_ , vol. 8, no. 11, p. e11662, Nov. 2022, doi: 10.1016/j.heliyon.2022.e11662. 

13 

- [13] K. H. Chan, W. H. Lim, and K. S. Wong, “Fusion algorithm of RRT* and Dijkstra for USV path planning in microplastic sampling missions,” _Ocean Engineering_ , vol. 291, p. 116439, 2024. 

- [14] O. M. Faltinsen, _Hydrodynamics of High-Speed Marine Vehicles_ . Cambridge: Cambridge University Press, 2006. 

- [15] D. J¨urgens and M. Palm, “Voith Schneider Propeller—Current Applications and New Developments,” in _Proc. 8th Int. Symp. Practical Design of Ships and Other Floating Structures_ , 2012. 

- [16] Nordic Semiconductor, _nRF24L01+ Single Chip 2.4 GHz Transceiver Product Specification v1.0_ , 2008. 

- [17] M. Margolis, _Arduino Cookbook_ , 2nd ed. Sebastopol, CA: O’Reilly Media, 2011. 

- [18] I. Buchmann, _Batteries in a Portable World: A Handbook on Rechargeable Batteries for Non-Engineers_ , 4th ed. Richmond, BC: Cadex Electronics Inc., 2017. 

- [19] Pascalou31, “RC Sail boat speed measurement and transmission,” _Arduino Forum_ , 2019. [Online]. Available: https://forum.arduino.cc 

- [20] Dr C, “Low power Nordic RF modules – what range can we expect?,” _Slotforum_ , 2021. [Online]. Available: https://slotforum.com 

- [21] AliExpress Wiki, “E01-2G4M27D Module: Real-World Performance of the nRF24L01P+PA+LNA with SAM-K Antenna,” 2024. [Online]. Available: https://aliexpress.com 

- [22] A. Zolich, A. Faltynkova, G. Johnsen, and T. A. Johansen, “Pamela: An uncrewed surface vehicle for sampling surface water particles,” in _OCEANS 2022 Hampton Roads_ , IEEE, 2022, doi: 10.1109/OCEANS47191.2022.9977294. 

- [23] FIS – Companies & Products, “Released Filtration Equipment for Collecting Microplastics,” 2021. [Online]. Available: https://fis-net.com 

- [24] J. Park, J. Jungwirth, and UVic Engineering Team, “Student engineering team invents USV prototype that removes microplastics from the ocean,” University of Victoria Faculty of Engineering and Computer Science, 2023. [Online]. Available: https://uvic.ca 

- [25] K. Rao _et al._ , “Robotic sampling of marine microplastics: a comprehensive review,” _Ocean Engineering_ , vol. 342, no. Part 1, p. 122691, 2025, doi: 10.1016/j.oceaneng.2025.122691. 

- [26] SPH Engineering, “UAV-based remote water sampling system,” 2021. [Online]. Available: https://sphengineering.com 

- [27] P. Prempraneerach and P. Kulvanit, “A comparative study on the propulsion performance of a surface vessel with water jet propulsion and propeller propulsion,” 2016. 

- [28] S. Arko, M. Das, R. Issa, and M. Rahman, “Autonomous surface vehicle for real-time monitoring of water bodies in Bangladesh,” in _2020 IEEE Global Humanitarian Technology Conference (GHTC)_ , 2020, doi: 10.1109/GHTC46280.2020.9342878. 

- [29] H. Lang, M. T. Khan, K.-K. Tan, and C. W. de Silva, “Application of visual servo control in autonomous mobile rescue robots,” _International Journal of Computers Communications & Control_ , vol. 11, no. 5, pp. 685–696, Oct. 2016. 

- [30] Z. Isahaku, “Improvement and empirical testing of a novel autonomous microplastics-collecting semisubmersible,” _arXiv preprint arXiv:2408.02162_ , Aug. 2024. 

14 

APPENDIX A PROJECT COST 

## _Budget for Materials_ 

|**Item**|**Description**|**Quantity**|**Cost/Unit (PHP)**|**Subtotal (PHP)**|
|---|---|---|---|---|
|1|12V 21W DC Pump|2|1000|2000|
|2|7.4V 28W Thruster|3|575|1725|
|3|Arduino Uno|1|350|350|
|4|6k mAh battery|2|1500|3000|
|5|1m Hose (1” diameter)|1|200|200|
|6|Acrylic polyglass sheet|1|750|750|
|7|Mesh flter set|1|766|766|
|8|Silicon hose|4|576|2094|
|9|Mighty Bond 3g|2|70|140|
|10|Epoxy Glue|2|105|210|
|11|PVC Hose 3/8 inches (1 meter)|1|50|50|
|12|Epoxy Bestcoat White|1|371|371|
|13|PVC Hose 5/8 inches (1 meter)|1|75|75|
|14|Tap Adaptor 1/2 inches|1|49|49|
|15|500 mAh battery|1|200|200|
|16|Devcon Big Epoxy|1|160|160|
|17|Arduino Nano|1|300|300|
|18|SX1278 LoRa Module|1|200|200|
|19|TM1637 4-Digit Seven-Segment Display|1|50|50|
|20|KY-023 Joystick Module|1|50|50|
|21|MAX B6 80W LiPo/NiMH Balance Digital Charger|1|1000|1000|
|22|Contingency|–|–|1935|
||||**Total**|**15,675**|



## _Budget for Laboratory Equipment/Apparatus Use_ 

|**Item**|**Description**|**Quantity**|**Cost/Unit **|**(PHP)**|**Subtotal (PHP)**|
|---|---|---|---|---|---|
|1|3d printer Filament|2|650||1300|
|2|Soldering iron|1|100||100|
|3|PCB printer|3|100||300|
|4|Contingency|-|-||825|
|||||**Total**|**2,525**|



15 

## _Miscellaneous Costs_ 

|**Item**|**Description**|**Quantity**|**Cost/Unit (PHP)**|**Subtotal (PHP)**|
|---|---|---|---|---|
|1|Bond Paper A4|1 ream|267|267|
|2|Printer Ink|2 units|2000|4000|
|3|Contingency|-|-|853|
||||**Total**|**5,120**|



_Total Costs_ 

|**Item**|**Description**||**Subtotal (PHP)**|
|---|---|---|---|
|1|Proposed Material Budget||15675|
|2|Proposed Laboratory|Budget|2525|
|3|Miscellaneous Costs||5120|
|||**Total**|**23,320**|



## APPENDIX B 

## PREVIOUS ITERATION 

This appendix presents supporting material from the previous iteration of the system, including earlier design configurations, subsystem layouts, prototype observations, and reference figures used to inform the current development. 

Fig. 24. Previous iteration robot overview 

Figure 24 shows the previous iteration of the water-sampling robot. This earlier prototype served as the baseline platform for the present work and helped identify issues in layout, integration, and protection of internal components that were improved in the current iteration. 

## APPENDIX C 

## DETAILED COMPONENT SPECIFICATIONS AND WIRING 

This appendix presents the detailed specifications and wiring-related information for the major electrical, mechanical, and communication components used in the developed robotic platform. 

_Pump and Filtration Components_ 

- 12V 21W DC pump used for water intake and surface sampling. 

- Mesh filter set used to retain collected microplastic particles during the sampling process. 

- PVC and silicon hoses used to guide water flow from the inlet to the filter assembly. 

16 

_Propulsion and Control Components_ 

- 7.4V 28W thrusters used for propulsion and directional movement. 

- Arduino Uno used as the primary microcontroller for robot-side control tasks. 

- Arduino Nano used for controller-side processing and wireless command transmission. 

- KY-023 joystick module and TM1637 4-digit seven-segment display used in the handheld controller. 

## _Communication Components_ 

- SX1278 LoRa module used to establish long-range wireless communication between the controller and the robot. 

- The communication link supports remote navigation and pump actuation during testing. 

## _Power System Components_ 

- System battery requirement: two hull-mounted batteries, each with a minimum capacity of _≥_ 8 _._ 635 Ah, for a combined required capacity of approximately 17 _._ 270 Ah over 1.5 hours of operation. 

- System energy requirement: each hull battery must provide approximately 108 _._ 801 Wh at a nominal voltage of 12 _._ 6 V, with a practical minimum discharge capability of 0 _._ 88 C. 

- Controller battery requirement: minimum battery capacity _≥_ 0 _._ 230 Ah, corresponding to approximately 1 _._ 702 Wh at 7 _._ 4 V, with a practical minimum discharge capability of 0 _._ 88 C. 

- Selected batteries: a 3S LiPo battery rated at 9000 mAh for each hull and a two-cell 7.4 V lithium-ion battery rated at 2500 mAh and 35 C for the handheld controller. 

- Power distribution is separated across propulsion, control, and communication subsystems to improve stability, weight balance, and electrical reliability. 

## APPENDIX D 

## COMMERCIALLY AVAILABLE BATTERIES 

This appendix presents commercially available controller-battery options considered for the handheld remote-control unit. 

||||TABLE VI|||
|---|---|---|---|---|---|
|||CONTROLLERBATTERY||||
|**Battery**|**Type / Voltage**|**C-Rating / Capacity**|**Dimensions**|**Weight**|**Image**|
|1|Li-ion; 7.4 V (max 8.4 V),|20C; 500 mAh|60 _×_ 16 _×_ 11 mm|28 g||
||2 cells|||||
|2|Li-ion; 3.7 V_×_2=7.4 V|35C; 500 mAh|14 _×_ 50 mm|15 g||
|3|Li-ion; 3.7 V_×_2=7.4 V|35C; 2500 mAh|14 _×_ 50 mm|15 g||



17 

SYSTEM BATTERY 

## TABLE VII 

|**Battery**|**Type **|**/ Voltage**|**C-Rating / Capacity**|**Dimensions**|**Dimensions**|||**Weight**|**Image**|
|---|---|---|---|---|---|---|---|---|---|
||||||||||ta|
|1|LiPo|(Lithium Polymer);|100C; 9000 mAh|166|_×_|49|_×_|561 g||
||11.1|V (max 12.6 V), 3||31.5 mm||||||
||cells|||||||||
|2|LiPo|(Lithium Polymer);|100C; 9000 mAh|160 _×_ 50 _×_ 31|||mm|550 g||
||11.1|V (max 12.6 V), 3||||||||
||cells|||||||||
|3|LiPo|(Lithium Polymer);|100C; 9000 mAh|163 _×_ 49 _×_ 30|||mm|552.1 g||
||11.1|V (max 12.6 V), 3||||||||
||cells|||||||||



18 

APPENDIX E GANTT CHART 

The Gantt chart in Figure 26 presents the project timeline and sequencing of major activities carried out during the development of the system. 

Fig. 26. Project Gantt Chart 

19 

Fig. 28. Project Gantt Chart Continuation 

20 

Fig. 30. Project Gantt Chart Continuation 

21 

Fig. 32. Project Gantt Chart Continuation 

22 

APPENDIX F STUDENT-ADVISER THESIS COUNSELING LOGBOOK 

Fig. 33. Student-Adviser Thesis Counseling Logbook 

23 

APPENDIX G NOTICE OF ACCEPTANCE 

Fig. 34. Notice of Acceptence 

24 

