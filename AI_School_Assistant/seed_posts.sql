-- Seed existing news.html and gallery.html content as real posts
-- Run: psql -U postgres -d communityboard -f seed_posts.sql
-- These are posted by the admin account (admin@school.mk)

DO $$
DECLARE admin_id INTEGER;
BEGIN
  SELECT id INTO admin_id FROM users WHERE email = 'admin@school.mk';

  -- News posts from news.html
  INSERT INTO posts (author_id, type, text, image_url, created_at) VALUES
  (admin_id, 'news', 'Свечено отворање на новата лабораторија за роботика — Со големо задоволство ја пуштивме во употреба новата лабораторија за роботика и автоматика, опремена со најсовремени уреди и 3D принтери.',
   'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', '2026-03-05 10:00:00'),

  (admin_id, 'news', 'Двајца наши ученици освоија прво место на државното натпреварување по програмирање — Учениците од четврта година – ЕКТИА насока блеснаа со своите решенија и го освоија првото место во категоријата „Напредно програмирање".',
   'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800', '2026-02-28 10:00:00'),

  (admin_id, 'news', 'Успешен завршен проект – паметна оранжерија направена од нашите ученици — Тим од ученици од природно-математичката насока создаде целосно автоматизирана оранжерија со IoT сензори и мобилна контрола.',
   'https://images.unsplash.com/photo-1581092160607-798c0e9a6ae3?w=800', '2026-02-15 10:00:00'),

  (admin_id, 'news', 'Наш ученик од билингвалната паралелка примен на престижен универзитет во Париз — По успешно завршено гимназиско образование во билингвалната паралелка, нашиот ученик беше примен на Sorbonne Université.',
   'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800', '2026-01-20 10:00:00'),

  -- Photo posts from gallery.html
  (admin_id, 'photo', 'Колаборативно учење — Тимски проекти на час по информатика',
   'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', '2025-12-10 10:00:00'),

  (admin_id, 'photo', 'Годишнина 2025 — Културен програм и доделување награди',
   'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=800', '2025-11-20 10:00:00'),

  (admin_id, 'photo', 'Научни експерименти — Хемија и физика во акција',
   'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800', '2025-11-05 10:00:00'),

  (admin_id, 'photo', 'Спортски ден — Кошарка и одбојка меѓу паралелките',
   'https://images.unsplash.com/photo-1522202176988-66273c2b033f?w=800', '2025-10-15 10:00:00'),

  (admin_id, 'photo', 'Театарска претстава — Годишен културен настан',
   'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800', '2025-09-25 10:00:00'),

  (admin_id, 'photo', 'Излет на Матка — Екскурзија во природа',
   'https://images.unsplash.com/photo-1516979187457-637a1ec45b07?w=800', '2025-09-10 10:00:00');

END $$;
