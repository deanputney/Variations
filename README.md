# Variations
Variations is an interactive conceptual art installation by Kevin McVey.

Its purpose is to explore the subtle beauty of simple, unique polygons given a user's creative input. Try it out [here](http://kevin.4mcveys.com/variations/variations.html).

Though the piece can be run in one's browser, its proper presentation is in the form of a physical installation. There are thus two versions of this code, one for the Web and one to be run on a Raspberry Pi. Please see the [project's homepage](http://kevin.4mcveys.com/v50/) for more. *(also pictures!)*

---

### Raspberry Pi
Variations is run as a web application in a Chromium kiosk window. This version, however, has been modified to operate using keyboard input in place of a GUI. 

For installation purposes, this keyboard can also be replaced with physical pushbuttons tied to the Raspberry Pi's GPIO. This code (located in /RasPi/Keyboard) requires [WiringPi](http://wiringpi.com/) and is thus built using the `-lwiringPi` gcc flag. A pinout to keyboard to action diagram is below:

```
WiringPi : Keyboard : Action
------------------------------------------------------
       0 :    Q     : Increase # of polygon sides
       1 :    A     : Decrease # of polygon sides
       2 :    W     : Increase # of drawn edges
       3 :    S     : Decrease # of drawn edges
       4 :    E     : Draw faint outline of polygon
       5 :    R     : Increase range of drawn polygons
       6 :    F     : Decrease range of drawn polygons
      11 :    T     : Shift range right
       8 :    G     : Shift range left
       9 :    C     : Reset to default
      10 :    P     : Print (or debug)
```

**Note** that the pins above are [WiringPi pins](http://wiringpi.com/pins/), and *do not* match the pin numbers used on the Raspberry Pi itself.

A custom autostart script is also provided here in the event that your installation is intended to boot straight into this software. Simply modify the file locations on lines 4 & 5, and then place the file in your Pi's `/etc/xdg/lxsession/LXDE-pi/autostart` directory.

---

### Web

Click on the control toggle on the left-hand side of the page to bring up the image parameters. From here, use the tool-tips and error messaging to guide your way through the piece. Share your unique artwork with friends by simply copy/pasting your automatically updating URL. Easy, right? :)