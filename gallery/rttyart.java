import java.awt.*;
import java.io.DataInputStream;
import java.io.BufferedInputStream;
import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.net.MalformedURLException;
import java.applet.Applet;
import java.applet.AppletContext;
import java.util.*;
import java.awt.event.*;



public class rttyart extends Applet 
{
  Font smallFont;
  Font largeFont;
  Font bigFont;
  int sCharW;
  int sCharH;   
  int big_pitch   = 14;    
  int large_pitch = 12;
  int small_pitch = 6;
  URL theURL;
  int stringcount = 0;
  String mypath  = null;
  String keyword = null;
  StringBuffer buf = new StringBuffer();
  String url ;
  int numberoffiles=0;
  int numberoflines=0;


 public void init()
 {
   Choice menu;
   add(menu = new Choice());
 
   mypath = getParameter("path");
	if (mypath == null) {
	    mypath = "http://www.rtty.com/";
	}
 
    int incounter = 0;
    keyword = getParameter("text");
    for (StringTokenizer t = new StringTokenizer(keyword, ",") ; t.hasMoreTokens() ; ) 
    {
	String str = t.nextToken();
         menu.addItem(str);
        numberoffiles++;
    } //end for loop
    smallFont = new Font("Courier",Font.BOLD,small_pitch);
    largeFont = new Font("Courier",Font.BOLD,large_pitch);
    bigFont = new Font("Courier",Font.BOLD,big_pitch);
    menu.setFont(largeFont);
    setBackground(new Color(0xE0FFFF)); 
 }

public boolean action(Event evt, Object arg) { 
     if (evt.target instanceof Choice) 
                HandleMenu((String)arg);
return true;
}

   
   protected void HandleMenu(String item) {
    try 
    { 
        // Create the Boeing URL
        url =  item ;
        theURL = new URL(mypath + item); 
    }
    catch ( MalformedURLException e) 
    {
      System.out.println("Bad URL: " + theURL);
    }
    URLConnection conn;
    DataInputStream data;
    String line;
    int mychar;
    buf.setLength(0);
    numberoflines=0;
    stringcount = 0;
    try 
    { 
      conn = theURL.openConnection();
      conn.connect();
      data = new DataInputStream(new BufferedInputStream(
		     conn.getInputStream()));
      while ((mychar = data.read()) > 0)
      {
         switch ((char)mychar) {
         case 'A': case 'B': case 'C': case 'D': case 'E': case 'F': case 'G':
         case 'H': case 'I': case 'J': case 'K': case 'L': case 'M': case 'N':
         case 'O': case 'P': case 'Q': case 'R': case 'S': case 'T': case 'U':
         case 'V': case 'W': case 'X': case 'Y': case 'Z': case '1': case '2':
         case '3': case '4': case '5': case '6': case '7': case '8': case '9':
         case '0': case '-': case '$': case '!': case '&': case '#': case 39 : //single quote
         case '(': case ')': case 34 : case '/': case ':': case ';': case '?': // quote
         case ',': case '.': case ' ':case '\n': case'\r':
           buf.append("" + (char)mychar);
           if ((char)mychar == '\n') numberoflines++;
           stringcount++;
           break;
         default: break; // noaction
         }
      } 
    }
    catch (IOException e) {
      System.out.println("IO Error:" + e.getMessage());
    }
    repaint();
 }
 

 public void MydrawString(Color color, Graphics g)
 {  
FontMetrics fm;
int sHeight;
int xPos;
int yPos;
char zz;     
int x,y,w,h;

//  Draw the status
    g.setFont(largeFont);
    g.setColor(color);
    fm = g.getFontMetrics();
    sHeight = fm.getHeight();
    xPos = 10; 
    yPos = 55;
    char[] xx = ("RTTY Art Viewer by Bill Bytheway - AA6ED").toCharArray();
    g.drawChars(xx, 0,xx.length ,xPos,yPos);
    yPos = yPos + sHeight - 2;
    char[] yy = ("Downloading " + stringcount + " bytes." + "["+url+"]").toCharArray();
    g.drawChars(yy, 0,yy.length ,xPos,yPos);
    yPos = yPos + sHeight;  //locate start of the box lower
 
//  Draw the Cream colored box using smaller fonts
    g.setFont(smallFont);
    fm = g.getFontMetrics();
    sHeight = fm.getHeight();
    x = 0; y = yPos; w=318; 
    h=numberoflines*(sHeight-2);
    if (h < 100 )  h = 100;
    g.setColor(Color.black); 
    g.drawRect(x, y, w, h);
    g.fillRect(x, y, w, h);
    g.setColor(new Color(0xFFFFE0)); 
    g.drawRect(x+3, y+3, w-6, h-6);
    g.fillRect(x+3, y+3, w-6, h-6);
    yPos = yPos + 12;



//  Draw the picture
    g.setColor(Color.black); // draw the text
    for (int i=0; i<stringcount; i++)
    {
    zz = buf.charAt(i);
    switch (zz)  {
      case '\r' : xPos = 4; break;
      case '\n' : yPos = yPos + sHeight - 2; break;
       default   : xPos = xPos + small_pitch - 2;
                 g.drawChars((""+zz).toCharArray(), 0,1 ,xPos,yPos);
                 break;
    }    // switch
   }     // for 
 }       //function
    
 public void paint( Graphics g)
 {
   g.setFont(largeFont);
   Dimension r = size();
   MydrawString(Color.black,g);
 }
  
}    // the program

