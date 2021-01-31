# evtripgame

<h2>Electric Vehicle Trip Simulator game.</h2>

<h3>Intro:</h3>

Ever wonder what kind of ideal flow you need to get on a stretch of highway for electric vehicles?
Place charging stations along the road thus allowing vehicles coming from the top to stop and charge.
Take note of their range, consumption and charging strategy to decide what the best location is for them and future ones.

The game will end when
<ul>
<li>A vehicle is stranded with 0% SoC.</li>
<li>A waiting vehicle in a charging station area has been waiting for more than 45 minutes.</li>
</ul>

<h3>Instructions:</h3>

< x1 > is the time factor selector:
This will speed up time while waiting for the vehicle\nto charge or to move.
Pause button: pauses time, stops charging or moving vehicles, you can still request info.
Add button: bring up the charging station creation dialog.

Charging station dialog:
First < > selection: choose the power of the station in watts.
Second < > selection: choose the number of charging spots/bays.
Distance: select on road: before adding a station you must click/tap on a precise location on the road on the right.
Add button: if you have enough money ($20000 = 20000 watts station) the station is added on the road and takes effect immediately.

Moving vehicles are represented by circles on the road on the right. The number in the circle represents the current state of charge. You can click on it the get extra info.

Charging stations: you can click on them to see the stats on the first line.
The lines below represents the charging bays.
The lines below those represent the waiting vehicles if any.

While a vehicle is charging you earn money. With that money you can bye more powerful charging stations and/or more bays.
Level ups will increase length of road and add charging strategies of the vehicles. Also the frequency of new vehicles will increase.

<h3>Charging strategies</h3>

Vehicles will adopt random charging strategies when created.
<ul>
      <li><b>Optimal:</b>
      Start charging when less than throttle threshold.
      Stop charging when throttling begins.
      </li>
      <li><b>Opportunistic:</b>
      Start charging when no other station ahead in range.
      Stop charging when in range of other station.
      </li>
      <li><b>Anxiety:</b>
      Start charging when near a charging station.
      Stop charging until 100% SoC.
      </li>
</ul>

<h3>TODO:</h3>

VERSION 1
<ul>
  <li>show scoreboard</li>
  <li>game over sequence</li>
  <li>stats screen after game over</li>
  <li>vehicle stats: show average speed</li>
  <li>validate addition of charging station wrt location</li>
</ul>

VERSION +1
<ul>
    <li>estimated range indication</li>
  <li>charging stations management and everything else. ;-)</li>
  <li>draw a road as a two-lane track with a striped centre line</li>
  <li>Let vehicles drive in both directions </li>
  <li>the user can end a loading session (== departing from vehicle)</li>
  <li>Queue management at charging station, when all slots are occupied</li>
  <li>Smooth entry and exit at the charging station</li>
</ul>
