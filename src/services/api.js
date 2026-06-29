export const fetchWorkshops = async () => {
  // Simulating an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'ws-01',
          title: 'Deep Sky Stacking & PixInsight Workflows',
          instructor: 'Dr. Aris Thorne',
          topic: 'astrophotography',
          topicLabel: 'Astrophotography',
          status: 'upcoming',
          statusLabel: 'Upcoming',
          date: 'July 18, 2026',
          time: '19:00 UTC',
          duration: '2.5 Hours',
          level: 'Advanced',
          prerequisites: ['Basic Astrophotography', 'PixInsight Trial Installed', '64-bit OS'],
          summary: 'Unlock the secrets to tracking processing nebulae. Learn how to accurately calibrate, register, stack subs, and manage background extraction constraints gracefully.',
          fullDetail: 'This intensive masterclass focuses heavily on post-processing nebulae and distant galaxy groups using modern digital darkroom suites. Dr. Thorne will walk you through a complete manual pipeline, handling complex calibration frames, dealing with dynamic light pollution artifacts, and optimizing linear non-destructive scaling steps before processing highlights.',
          agenda: [
            'Introduction to Linear vs Non-Linear data states.',
            'Image calibration (Darks, Flats, Biases).',
            'Dynamic Background Extraction (DBE) techniques.',
            'Star removal (StarNet++) and selective masking.',
            'Final Q&A and community showcase.',
          ],
          presentationLink: 'https://example.com/slides/pixinsight-workflow.pdf',
        },
        {
          id: 'ws-02',
          title: 'Live Sky Capture & Planetary Imaging',
          instructor: 'Sarah Jenkins',
          topic: 'astrophotography',
          topicLabel: 'Astrophotography',
          status: 'ongoing',
          statusLabel: 'Ongoing Live',
          date: 'Right Now',
          time: 'Ongoing',
          duration: '1.5 Hours remain',
          level: 'Intermediate',
          prerequisites: ['Equatorial Mount Basics', 'Understanding Exposure/Gain'],
          summary: 'We are currently online adjusting scope parameters on the club tracker node to image Jupiter and Saturn live. Tune into raw feed capturing.',
          fullDetail: 'A real-time live-stream operational exercise tracking planets via high frame-rate lucky imaging methodology. The session covers real-time adjustments on critical focus shifts, filter configuration swap times, and sensor temperature management variables.',
          agenda: [
            'Live connection to Club Telescope Node 04.',
            'Lucky imaging theory: Beating atmospheric seeing.',
            'Capturing SER video files of Jupiter.',
            'Live stacking preview using AutoStakkert.',
          ],
          presentationLink: null,
        },
        {
          id: 'ws-03',
          title: 'Introduction to Dark Matter & Cosmic Web Filamentary Structures',
          instructor: 'Prof. Alan Vance',
          topic: 'astrophysics',
          topicLabel: 'Astrophysics',
          status: 'upcoming',
          statusLabel: 'Upcoming',
          date: 'August 02, 2026',
          time: '15:00 UTC',
          duration: '3 Hours',
          level: 'Beginner',
          prerequisites: ['None. Open to all curiosity levels.'],
          summary: 'An structural deep-dive analytical overview detailing cosmic lensing mechanisms used to deduce micro-structures of hidden cold cluster elements.',
          fullDetail: 'Geared towards mathematical modeling amateurs, this talk sets expectations clearly regarding gravitational anomalies detected via early Euclid data structures. Basic orbital vectors understanding is recommended but not mandatory.',
          agenda: [
            "Historical context: Vera Rubin's galaxy rotation curves.",
            'Gravitational lensing and mapping invisible mass.',
            'The Cosmic Web: Filaments, nodes, and voids.',
            'Future probes and the role of the Nancy Grace Roman telescope.',
          ],
          presentationLink: 'https://example.com/slides/dark-matter-intro.pdf',
        },
        {
          id: 'ws-04',
          title: 'Equatorial Mount Tuning & Backlash Calibration',
          instructor: 'Marcus Vance',
          topic: 'hardware',
          topicLabel: 'Telescope Hardware',
          status: 'completed',
          statusLabel: 'Completed',
          date: 'June 14, 2026',
          time: 'Archived Session',
          duration: '2 Hours',
          level: 'Advanced',
          prerequisites: ['Own an Equatorial Mount', 'Hex Key Toolkit', 'PHD2 Installed'],
          summary: 'A practical breakdown mechanics tutorial on minimizing physical gear backlash tolerances on commercial belt-driven telescope mounts.',
          fullDetail: 'This recorded hardware session outlines the physical tearing down, gear polishing, regreasing, and digital guiding assistant configuration adjustments needed to minimize persistent guide star calibration deviations.',
          agenda: [
            'Identifying RA/DEC backlash symptoms in guide graphs.',
            'Physical teardown and belt tensioning.',
            'Worm gear meshing and greasing protocols.',
            'Software calibration: PHD2 Guiding Assistant runs.',
          ],
          presentationLink: 'https://example.com/slides/mount-tuning-v2.pdf',
        }
      ]);
    }, 800); // 800ms delay to simulate network request
  });
};

export const fetchEvents = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'ev-01',
          title: 'Perseid Meteor Shower Watch',
          date: 'July 15, 2026',
          time: '22:00 Local Time',
          location: 'Observatory Hill',
          description: 'Join us for the annual Perseids Peak! We will set up multiple light gathering scopes and have a guided tour of summer constellations.',
          capacity: '50 observers',
          status: 'Open'
        },
        {
          id: 'ev-02',
          title: 'Lunar Eclipse Live-Tracking',
          date: 'July 22, 2026',
          time: '01:30 UTC',
          location: 'Online Sync / Discord',
          description: 'A live tracking broadcast of the partial lunar eclipse. We will stream raw feeds from our remote observatory nodes.',
          capacity: 'Unlimited',
          status: 'Open'
        },
        {
          id: 'ev-03',
          title: 'Saturn Opposition Stargazing',
          date: 'August 05, 2026',
          time: '20:30 Local Time',
          location: 'Main Campus Observatory',
          description: 'Saturn is closest to Earth and fully illuminated by the Sun. Great opportunity to photograph the ring structure and Titan.',
          capacity: '30 observers',
          status: 'Filled'
        }
      ]);
    }, 600);
  });
};
