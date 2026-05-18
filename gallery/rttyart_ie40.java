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


public class rttyart extends Applet implements ItemListener 
{
  Font appFont;
  int sCharW;
  int sCharH;       
  int pitch = 10;
  URL theURL;
  int stringcount = 0;
  String keyword = null;
  StringBuffer buf = new StringBuffer();
  String url ;
  int numberoffiles=0;
  int numberoflines=0;

   Choice menu;

 

 public void init()
 {

   Choice menu = new Choice();
   menu.addItemListener( this );

  
    int incounter = 0;
    keyword = getParameter("text");
    for (StringTokenizer t = new StringTokenizer(keyword, ",") ; t.hasMoreTokens() ; ) 
    {
	String str = t.nextToken();
         menu.addItem(str);
        numberoffiles++;
    } //end for loop
    add(menu);
    appFont = new Font("Courier",Font.BOLD,pitch);
    setBackground(Color.black); 
 }



   public void itemStateChanged(ItemEvent e) 
    {
      if (e.getSource() instanceof Choice)
            HandleMenu(e.getItem());
        return ;
    }

  
   protected void HandleMenu(Object item) {
    try 
    { 
        // Create the Boeing URL
        theURL = new URL("http://44.24.103.19/" + item); 
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
    FontMetrics fm = g.getFontMetrics();
    int sHeight = fm.getHeight();
    int xPos = 0;
//  yPos = numberoffiles/ filesPerRow / heightPerRow    
    int yPos = (int)((numberoffiles / 7) * 35);
    char zz;
    g.setColor(new Color(0xFFFFE0));       //  
    int x,y,w,h;
    x = 0; y = yPos + (sHeight*2) + 10; w=640; h=numberoflines*(sHeight-2);
    g.drawRect(x, y, w, h);
    g.fillRect(x, y, w, h);
    g.setColor(Color.white); 

//    yPos = yPos + sHeight - 2;
    char[] xx = ("RTTY Art Viewer by Bill Bytheway - AA6ED").toCharArray();
    g.drawChars(xx, 0,xx.length ,50,yPos);
    yPos = yPos + sHeight - 2;
    char[] yy = ("Downloading " + stringcount + " bytes." + "["+url+"]").toCharArray();
    g.drawChars(yy, 0,yy.length ,50,yPos);
    yPos = yPos + sHeight - 2;
    g.setColor(color);
    for (int i=0; i<stringcount; i++)
    {
    zz = buf.charAt(i);
    switch (zz)  {
      case '\r' : xPos = 0; break;
      case '\n' : yPos = yPos + sHeight - 2; break;
       default   : xPos = xPos + pitch - 2;
                 g.drawChars((""+zz).toCharArray(), 0,1 ,xPos,yPos);
                 break;
    }    // switch
   }     // for 
 }       //function
    
 public void paint( Graphics g)
 {
   Dimension r = size();
   g.setFont(appFont);
   MydrawString(Color.black,g);
 }
  
}    // the program

