SELECT setval('classes_id_seq', (SELECT COALESCE(MAX(id),1) FROM public.classes));
INSERT INTO public.classes (name)
SELECT 'OFERTA AVULSA (SEM CLASSE)'
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'OFERTA AVULSA (SEM CLASSE)');