========================================================================
       MICROSOFT FOUNDATION CLASS LIBRARY : RTTYApp
========================================================================


AppWizard has created this RTTYApp application for you.  This application
not only demonstrates the basics of using the Microsoft Foundation classes
but is also a starting point for writing your application.

This file contains a summary of what you will find in each of the files that
make up your RTTYApp application.

RTTYApp.dsp
    This file (the project file) contains information at the project level and
    is used to build a single project or subproject. Other users can share the
    project (.dsp) file, but they should export the makefiles locally.

RTTYApp.h
    This is the main header file for the application.  It includes other
    project specific headers (including Resource.h) and declares the
    CRTTYAppApp application class.

RTTYApp.cpp
    This is the main application source file that contains the application
    class CRTTYAppApp.

RTTYApp.rc
    This is a listing of all of the Microsoft Windows resources that the
    program uses.  It includes the icons, bitmaps, and cursors that are stored
    in the RES subdirectory.  This file can be directly edited in Microsoft
	Visual C++.

RTTYApp.clw
    This file contains information used by ClassWizard to edit existing
    classes or add new classes.  ClassWizard also uses this file to store
    information needed to create and edit message maps and dialog data
    maps and to create prototype member functions.

res\RTTYApp.ico
    This is an icon file, which is used as the application's icon.  This
    icon is included by the main resource file RTTYApp.rc.

res\RTTYApp.rc2
    This file contains resources that are not edited by Microsoft 
	Visual C++.  You should place all resources not editable by
	the resource editor in this file.




/////////////////////////////////////////////////////////////////////////////

AppWizard creates one dialog class:

RTTYAppDlg.h, RTTYAppDlg.cpp - the dialog
    These files contain your CRTTYAppDlg class.  This class defines
    the behavior of your application's main dialog.  The dialog's
    template is in RTTYApp.rc, which can be edited in Microsoft
	Visual C++.


/////////////////////////////////////////////////////////////////////////////
Other standard files:

StdAfx.h, StdAfx.cpp
    These files are used to build a precompiled header (PCH) file
    named RTTYApp.pch and a precompiled types file named StdAfx.obj.

Resource.h
    This is the standard header file, which defines new resource IDs.
    Microsoft Visual C++ reads and updates this file.

/////////////////////////////////////////////////////////////////////////////
Other notes:

AppWizard uses "TODO:" to indicate parts of the source code you
should add to or customize.

If your application uses MFC in a shared DLL, and your application is 
in a language other than the operating system's current language, you
will need to copy the corresponding localized resources MFC42XXX.DLL
from the Microsoft Visual C++ CD-ROM onto the system or system32 directory,
and rename it to be MFCLOC.DLL.  ("XXX" stands for the language abbreviation.
For example, MFC42DEU.DLL contains resources translated to German.)  If you
don't do this, some of the UI elements of your application will remain in the
language of the operating system.

/////////////////////////////////////////////////////////////////////////////



// Initialize mode
// Allowable Options
$ASCII    // MODE = ASCII
$MILITARY // MODE = MILITARY
$ITA2     // MODE = ITA2
$TELEX    // MODE = TELEX
$PSK31    // MODE = PSK31
$CW       // MODE = real CW

Mode = $MILITARY

// Set the Buad rate, fixed rates
// Allowable options
// $B45      // 45.45
// $B50      // 50.0
// $B56      // 56.9
// $B74      // 74.4
// $B100     // 100.0
// $B110     // 110.0
// $B300     // 300.0

Baud = $B45

// Set FSK center frequency, freestyle
$FSK=xxx.x// Set FSK Center Freq

Set PSK center frequency, fixed.
$F1500    // PSKFreq = 1500
$F1600    // PSKFreq = 1600
$F1700    // PSKFreq = 1700
$F1800    // PSKFreq = 1800
$F1900    // PSKFreq = 1900
$F2000    // PSKFreq = 2000
$F2100    // PSKFreq = 2100

// Set standard options
$HEADER   // Send Header/Footer
$NOHEADER // No Header/Footer
$DITTLE   // George's Dittle
$NODITTLE // No Dittle
$DISABLE  // Disable AutoSend


// Set the commport, standard options only
$COM1     // Comport = 0x3F8
$COM2     // Comport = 0x2F8
$COM3     // Comport = 0x3E8
$COM4     // Comport = 0x3E0
$COM5     // Comport = 0x2F0
$COM6     // Comport = 0x2E8
$COM7     // Comport = 0x2E0
$COM8     // Comport = 0x260

// Set transmit control either to RTS or DTR
$RTS      // Debug Only : Use RTS for XMIT
$DTR      // Debug Only : Use DTR for XMIT
