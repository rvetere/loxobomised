# TODO

- mehr pause zwischen commands in einem run
- möglich machen einen living rollo alleine zu steuern
- daten für alle rollos auslesen dasmit jederzeit bekannt ist, wo einer steht und ob er gerade läuft - controlJalousie verlassen wenn gerät noch läuft
- feststellen ob eine aktion geklappt hat - und nur mal loggen
- tracken wie oft ich "container not found" habe in der app
  - wenn zu viel in kurzer zeit, error screenshot und prozess beenden (besser wir restarten durch pm2)
- wenn rollo auf 100% geschlossen ist begreift mein script nicht, dass er tilten soll -> auslesen ob getiltet ist oder nicht
- weitere spannende aktionen verknüpfen wie "zentral aus", "alle rollos runter"

- auslesen von daten, innerhalb der vorhandenen instanzen alle zustände pollen, zusätzliche instanz bauen um dinge wie temperatur und heizsstufe auszulesen sporadisch
- zustände abbilden in HA (jalousie %, licht an/aus/%, temperatur, heizstufe, ventilation)
