========================================================================
       RTTYMailer
========================================================================

RTTYMailer queues plain-text files and delivers them to the internet-TTY
gateway, which prints them on real Teletype machines. It talks SMTP
directly over a Winsock socket rather than going through a mail client.
A companion compose window handles the RTTY/Baudot character set.

RTTYMailer is one half of a pair; RTTYApp is the other. The two are
versioned independently -- a version number here says nothing about
RTTYApp's.

Original author: Bill Bytheway, K7TTY.
Currently maintained by Paul Heller, W2TTY.
Support: rtty.com

See changes.txt for the release history, and CLAUDE.md for the build and
architecture notes.


Building
------------------------------------------------------------------------

Visual Studio 2022 (platform toolset v143), Win32 only:

    msbuild RTTYMailer.sln /p:Configuration=Release /p:Platform=Win32

x86 is a hard requirement, not inertia -- the companion RTTYApp depends
on the 32-bit PSKCore.dll, so the whole family stays 32-bit. There is
deliberately no x64 configuration. The project uses static MFC and the
MultiByte character set; the code assumes char/ANSI throughout.

The installer is an Inno Setup script, installer\RTTYMailer.iss. Build a
Release configuration first, then compile the script with ISCC.exe. The
result lands in installer\Output\.

To release a new version, change APP_VER_MAJOR and APP_VER_MINOR in
version.h -- those two numbers are the only place the version is
written, and everything in the program derives from them. Then update
MyAppVersion in the .iss to match (Inno Setup cannot read a C header, so
that one is manual), and add an entry at the top of changes.txt.


Files the program uses at run time
------------------------------------------------------------------------

All of these live in the program's working directory, alongside the exe.
This is why the installer targets C:\RTTYMailer rather than Program
Files -- a standard user may not write there.

    servers.ini             Gateway list. One entry per line, formatted
                            name;address;port; -- the trailing semicolon
                            is required or the port will not parse. An
                            optional fourth field gives the SMTP mailbox
                            when it differs from the displayed name:
                            ITTY 100;internet-tty.net;595;100; shows
                            "ITTY 100" but delivers to "100". Without it,
                            the mailbox is the name.
    servers_additional.ini  Optional second list, read only if present.
                            Put local or private servers here; the
                            installer never overwrites this file.
    RTTYMailer.INI          Main window state. A positional flat file,
                            one value per line: recipient, server,
                            subject, mail-from, SMTP port, then one line
                            per queued file. Line order matters.
    RTTYEditor.INI          Compose window state: from, to, subject, then
                            the recipient history.
    YYYYMMDD.log            One log file per day.
    AutoStartMail\          Composed and queued messages.


Source layout
------------------------------------------------------------------------

    RTTYMailer.cpp/.h        Application class, CRTTYMailerApp.
    RTTYMailerDlg.cpp/.h     Main window. Owns the send queue and the
                             entire SMTP client (SendMailInQueue).
    RTTYMailerEditor.cpp/.h  Modeless compose window.
    SearchBadWords.cpp/.h    Find/replace dialog, driven by
                             BadWordsList.h.
    printer.cpp/.h           Printing support.
    version.h                Single source of truth for version, product
                             name, copyright and attribution.
    RTTYMailer.rc            Dialogs, menus, strings, version resource.
    resource.h               Resource IDs.

The .dsp/.dsw files are dead VC6 leftovers and can be ignored.
