# CrowdWatcher

This project is the open-source eye tracking platform `CrowdWatcher`. It enables researchers to measure visual attention and user engagement in a crowdsourcing context through traditional RGB webcams. 

Its general idea is to use conventional RGB cameras, such as the one provided with a laptop, to measure where the participants are looking on the screen faced to them. The key aspect of the platform is to use the interactions of the user with his computer as a way to perform an online calibration of the eye tracker. Indeed, it is expected that when a participant performs an action such as a click, he will be looking at the position on the screen while performing the click. Therefore, at the very moment of the click, it is possible to relate pupil center position from the video stream to a position on the screen. Based on this principle, a browser-based real- time audio/video processing using WebRTC was developed enabling to perform tests in a crowdsourcing context.

The platform has two parts: a client and a server side. The client side employs WebRTC to turn on the camera of the participants and record their face while performing the task, and in parallel record actions of the user with the platform. 

The server side of the platform is in charge of delivering the content to the client, retrieving the measurements performed on the client side, and performing the fixations estimations based on the webcam video stream and user actions logs.


# Structure of the project

   - The folder `analysis` provides the tools necessary to estimate fixations based on the webcam video stream and user action logs.

   - The folder `www` contains the web applications which have to be installed on the server to distribute the crowdsourcing experiment. 


# Virtual machine

A easy to use virtual machine is under preparation and will be soon available. It will be uploaded on Zenodo: https://zenodo.org  

Update (2017.06.30): The virtual machine should be available in the coming days. 


# Publications related to this work

   - Pierre Lebreton, Alexander Raake, Evangelos Skodras, Toni Mäki, Isabelle Hupont and Matthias Hirth (2014), "Bridging the gap between eye tracking and crowdsourcing", ITU-T SG12 Contribution 233, Source: Deutsche Telekom AG Q13/12, Q14/12, Sept. 02 2014

   - Pierre Lebreton, Evangelos Skodras, Toni Mäki, Isabelle Hupont and Matthias Hirth, (2015), "Bridging the gap between eye tracking and crowdsourcing", SPIE Conference on Human Vision and Electronic Imaging XX, San Francisco

   - Pierre Lebreton, Isabelle Hupont, Toni Mäki, Evangelos Skodras and Matthias Hirth, (2015), "Eye tracker in the wild, studying the delta between what is said and done in a crowdsourcing experiment", Proceedings of the 2015 Inter- national ACM Workshop on Crowdsourcing for Multimedia, Brisbane, Australia





