--
-- PostgreSQL database dump
--

\restrict RQWo1JTJDaVjG1LtFc8COVdZDow0XVqvD7FNSjN0xGlmm6HchGSWk8VRaX4kVLt

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-03-20 13:16:09

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: danh_gia_ncc; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.danh_gia_ncc (
    ma_danh_gia integer NOT NULL,
    ma_ncc integer,
    ma_tieu_chi integer,
    diem double precision
);


ALTER TABLE public.danh_gia_ncc OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16393)
-- Name: danh_gia_ncc_ma_danh_gia_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.danh_gia_ncc_ma_danh_gia_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.danh_gia_ncc_ma_danh_gia_seq OWNER TO postgres;

--
-- TOC entry 5079 (class 0 OID 0)
-- Dependencies: 220
-- Name: danh_gia_ncc_ma_danh_gia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.danh_gia_ncc_ma_danh_gia_seq OWNED BY public.danh_gia_ncc.ma_danh_gia;


--
-- TOC entry 221 (class 1259 OID 16394)
-- Name: du_lieu_rf; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.du_lieu_rf (
    ma_du_lieu integer NOT NULL,
    gia double precision,
    chat_luong double precision,
    thoi_gian_giao_hang double precision,
    uy_tin double precision,
    nang_luc_cung_ung double precision,
    tinh_linh_hoat double precision,
    dieu_kien_thanh_toan double precision,
    dich_vu_ho_tro double precision,
    ket_qua integer
);


ALTER TABLE public.du_lieu_rf OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16398)
-- Name: du_lieu_rf_ma_du_lieu_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.du_lieu_rf_ma_du_lieu_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.du_lieu_rf_ma_du_lieu_seq OWNER TO postgres;

--
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 222
-- Name: du_lieu_rf_ma_du_lieu_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.du_lieu_rf_ma_du_lieu_seq OWNED BY public.du_lieu_rf.ma_du_lieu;


--
-- TOC entry 223 (class 1259 OID 16399)
-- Name: ket_qua_quyet_dinh; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ket_qua_quyet_dinh (
    ma_ket_qua integer NOT NULL,
    ma_ncc integer,
    diem_ahp double precision,
    du_doan_rf double precision,
    diem_tong double precision,
    ket_luan character varying(50)
);


ALTER TABLE public.ket_qua_quyet_dinh OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16403)
-- Name: ket_qua_quyet_dinh_ma_ket_qua_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ket_qua_quyet_dinh_ma_ket_qua_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ket_qua_quyet_dinh_ma_ket_qua_seq OWNER TO postgres;

--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 224
-- Name: ket_qua_quyet_dinh_ma_ket_qua_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ket_qua_quyet_dinh_ma_ket_qua_seq OWNED BY public.ket_qua_quyet_dinh.ma_ket_qua;


--
-- TOC entry 225 (class 1259 OID 16404)
-- Name: nha_cung_cap; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nha_cung_cap (
    ma_ncc integer NOT NULL,
    ten_ncc character varying(255) NOT NULL,
    dia_chi text,
    so_dien_thoai character varying(20),
    email character varying(100),
    mo_ta text
);


ALTER TABLE public.nha_cung_cap OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16411)
-- Name: nha_cung_cap_ma_ncc_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nha_cung_cap_ma_ncc_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nha_cung_cap_ma_ncc_seq OWNER TO postgres;

--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 226
-- Name: nha_cung_cap_ma_ncc_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nha_cung_cap_ma_ncc_seq OWNED BY public.nha_cung_cap.ma_ncc;


--
-- TOC entry 227 (class 1259 OID 16412)
-- Name: so_sanh_cap_ahp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.so_sanh_cap_ahp (
    ma_so_sanh integer NOT NULL,
    tieu_chi_1 integer,
    tieu_chi_2 integer,
    gia_tri double precision
);


ALTER TABLE public.so_sanh_cap_ahp OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16416)
-- Name: so_sanh_cap_ahp_ma_so_sanh_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.so_sanh_cap_ahp_ma_so_sanh_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.so_sanh_cap_ahp_ma_so_sanh_seq OWNER TO postgres;

--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 228
-- Name: so_sanh_cap_ahp_ma_so_sanh_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.so_sanh_cap_ahp_ma_so_sanh_seq OWNED BY public.so_sanh_cap_ahp.ma_so_sanh;


--
-- TOC entry 229 (class 1259 OID 16417)
-- Name: tieu_chi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tieu_chi (
    ma_tieu_chi integer NOT NULL,
    ten_tieu_chi character varying(255) NOT NULL,
    mo_ta text
);


ALTER TABLE public.tieu_chi OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16424)
-- Name: tieu_chi_ma_tieu_chi_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tieu_chi_ma_tieu_chi_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tieu_chi_ma_tieu_chi_seq OWNER TO postgres;

--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 230
-- Name: tieu_chi_ma_tieu_chi_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tieu_chi_ma_tieu_chi_seq OWNED BY public.tieu_chi.ma_tieu_chi;


--
-- TOC entry 231 (class 1259 OID 16425)
-- Name: trong_so_tieu_chi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trong_so_tieu_chi (
    ma_trong_so integer NOT NULL,
    ma_tieu_chi integer,
    trong_so double precision
);


ALTER TABLE public.trong_so_tieu_chi OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16429)
-- Name: trong_so_tieu_chi_ma_trong_so_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trong_so_tieu_chi_ma_trong_so_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trong_so_tieu_chi_ma_trong_so_seq OWNER TO postgres;

--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 232
-- Name: trong_so_tieu_chi_ma_trong_so_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trong_so_tieu_chi_ma_trong_so_seq OWNED BY public.trong_so_tieu_chi.ma_trong_so;


--
-- TOC entry 4886 (class 2604 OID 16430)
-- Name: danh_gia_ncc ma_danh_gia; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.danh_gia_ncc ALTER COLUMN ma_danh_gia SET DEFAULT nextval('public.danh_gia_ncc_ma_danh_gia_seq'::regclass);


--
-- TOC entry 4887 (class 2604 OID 16431)
-- Name: du_lieu_rf ma_du_lieu; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.du_lieu_rf ALTER COLUMN ma_du_lieu SET DEFAULT nextval('public.du_lieu_rf_ma_du_lieu_seq'::regclass);


--
-- TOC entry 4888 (class 2604 OID 16432)
-- Name: ket_qua_quyet_dinh ma_ket_qua; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ket_qua_quyet_dinh ALTER COLUMN ma_ket_qua SET DEFAULT nextval('public.ket_qua_quyet_dinh_ma_ket_qua_seq'::regclass);


--
-- TOC entry 4889 (class 2604 OID 16433)
-- Name: nha_cung_cap ma_ncc; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nha_cung_cap ALTER COLUMN ma_ncc SET DEFAULT nextval('public.nha_cung_cap_ma_ncc_seq'::regclass);


--
-- TOC entry 4890 (class 2604 OID 16434)
-- Name: so_sanh_cap_ahp ma_so_sanh; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.so_sanh_cap_ahp ALTER COLUMN ma_so_sanh SET DEFAULT nextval('public.so_sanh_cap_ahp_ma_so_sanh_seq'::regclass);


--
-- TOC entry 4891 (class 2604 OID 16435)
-- Name: tieu_chi ma_tieu_chi; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tieu_chi ALTER COLUMN ma_tieu_chi SET DEFAULT nextval('public.tieu_chi_ma_tieu_chi_seq'::regclass);


--
-- TOC entry 4892 (class 2604 OID 16436)
-- Name: trong_so_tieu_chi ma_trong_so; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trong_so_tieu_chi ALTER COLUMN ma_trong_so SET DEFAULT nextval('public.trong_so_tieu_chi_ma_trong_so_seq'::regclass);


--
-- TOC entry 5060 (class 0 OID 16389)
-- Dependencies: 219
-- Data for Name: danh_gia_ncc; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.danh_gia_ncc (ma_danh_gia, ma_ncc, ma_tieu_chi, diem) FROM stdin;
1	1	1	4
2	1	2	350
3	1	3	3
4	1	4	3
5	1	5	4
6	1	6	4
7	1	7	4
8	1	8	3
9	1	9	5
10	1	10	5
11	1	11	2
12	1	12	50
13	2	1	2
14	2	2	350
15	2	3	2
16	2	4	5
17	2	5	4
18	2	6	3
19	2	7	5
20	2	8	4
21	2	9	6
22	2	10	7
23	2	11	3
24	2	12	60
25	3	1	2
26	3	2	450
27	3	3	3
28	3	4	6
29	3	5	5
30	3	6	4
31	3	7	7
32	3	8	8
33	3	9	9
34	3	10	8
35	3	11	4
36	3	12	30
37	4	1	4
38	4	2	260
39	4	3	3
40	4	4	6
41	4	5	8
42	4	6	5
43	4	7	7
44	4	8	8
45	4	9	9
46	4	10	7
47	4	11	1
48	4	12	40
49	5	1	3
50	5	2	170
51	5	3	3
52	5	4	7
53	5	5	6
54	5	6	2
55	5	7	6
56	5	8	5
57	5	9	4
58	5	10	7
59	5	11	2
60	5	12	35
61	6	1	4
62	6	2	180
63	6	3	1
64	6	4	8
65	6	5	8
66	6	6	2
67	6	7	9
68	6	8	7
69	6	9	5
70	6	10	8
71	6	11	0.5
72	6	12	55
73	7	1	3
74	7	2	350
75	7	3	1
76	7	4	3
77	7	5	4
78	7	6	4
79	7	7	4
80	7	8	3
81	7	9	5
82	7	10	5
83	7	11	2
84	7	12	62
85	8	1	3
86	8	2	250
87	8	3	1
88	8	4	6
89	8	5	5
90	8	6	3
91	8	7	6
92	8	8	5
93	8	9	4
94	8	10	6
95	8	11	4
96	8	12	78
97	9	1	5
98	9	2	360
99	9	3	4
100	9	4	9
101	9	5	8
102	9	6	5
103	9	7	8
104	9	8	6
105	9	9	5
106	9	10	6
107	9	11	3
108	9	12	120
109	10	1	4
110	10	2	240
111	10	3	4
112	10	4	9
113	10	5	8
114	10	6	3
115	10	7	8
116	10	8	6
117	10	9	6
118	10	10	7
119	10	11	1
120	10	12	50
121	11	1	5
122	11	2	120
123	11	3	4
124	11	4	5
125	11	5	6
126	11	6	4
127	11	7	6
128	11	8	7
129	11	9	7
130	11	10	5
131	11	11	2
132	11	12	45
133	12	1	2
134	12	2	520
135	12	3	5
136	12	4	7
137	12	5	6
138	12	6	2
139	12	7	6
140	12	8	5
141	12	9	8
142	12	10	8
143	12	11	2
144	12	12	65
145	13	1	3
146	13	2	190
147	13	3	5
148	13	4	7
149	13	5	8
150	13	6	3
151	13	7	8
152	13	8	8
153	13	9	9
154	13	10	4
155	13	11	1
156	13	12	80
157	14	1	4
158	14	2	450
159	14	3	5
160	14	4	8
161	14	5	7
162	14	6	4
163	14	7	7
164	14	8	6
165	14	9	7
166	14	10	5
167	14	11	3
168	14	12	90
169	15	1	3
170	15	2	350
171	15	3	3
172	15	4	6
173	15	5	6
174	15	6	4
175	15	7	6
176	15	8	5
177	15	9	5
178	15	10	4
179	15	11	4
180	15	12	150
181	16	1	5
182	16	2	650
183	16	3	2
184	16	4	7
185	16	5	7
186	16	6	3
187	16	7	7
188	16	8	8
189	16	9	6
190	16	10	6
191	16	11	3
192	16	12	220
193	17	1	2
194	17	2	870
195	17	3	3
196	17	4	8
197	17	5	9
198	17	6	5
199	17	7	4
200	17	8	3
201	17	9	4
202	17	10	4
203	17	11	1
204	17	12	30
205	18	1	4
206	18	2	350
207	18	3	1
208	18	4	6
209	18	5	5
210	18	6	3
211	18	7	5
212	18	8	4
213	18	9	5
214	18	10	6
215	18	11	2
216	18	12	56
217	19	1	5
218	19	2	350
219	19	3	5
220	19	4	3
221	19	5	4
222	19	6	4
223	19	7	3
224	19	8	5
225	19	9	4
226	19	10	7
227	19	11	3
228	19	12	45
229	20	1	4
230	20	2	650
231	20	3	4
232	20	4	4
233	20	5	5
234	20	6	3
235	20	7	5
236	20	8	4
237	20	9	6
238	20	10	3
239	20	11	3
240	20	12	78
241	21	1	5
242	21	2	450
243	21	3	1
244	21	4	5
245	21	5	4
246	21	6	4
247	21	7	6
248	21	8	5
249	21	9	6
250	21	10	5
251	21	11	4
252	21	12	66
253	22	1	3
254	22	2	400
255	22	3	2
256	22	4	5
257	22	5	5
258	22	6	4
259	22	7	4
260	22	8	6
261	22	9	7
262	22	10	3
263	22	11	3
264	22	12	55
265	23	1	3
266	23	2	550
267	23	3	3
268	23	4	6
269	23	5	8
270	23	6	3
271	23	7	5
272	23	8	4
273	23	9	5
274	23	10	4
275	23	11	4
276	23	12	35
277	24	1	3
278	24	2	350
279	24	3	3
280	24	4	8
281	24	5	9
282	24	6	3
283	24	7	7
284	24	8	8
285	24	9	7
286	24	10	4
287	24	11	5
288	24	12	45
289	25	1	2
290	25	2	640
291	25	3	4
292	25	4	7
293	25	5	9
294	25	6	4
295	25	7	8
296	25	8	7
297	25	9	8
298	25	10	3
299	25	11	1
300	25	12	71
301	26	1	3
302	26	2	120
303	26	3	2
304	26	4	8
305	26	5	7
306	26	6	2
307	26	7	9
308	26	8	8
309	26	9	9
310	26	10	4
311	26	11	3
312	26	12	25
313	27	1	3
314	27	2	450
315	27	3	3
316	27	4	9
317	27	5	8
318	27	6	3
319	27	7	8
320	27	8	7
321	27	9	6
322	27	10	3
323	27	11	2
324	27	12	53
325	28	1	4
326	28	2	350
327	28	3	4
328	28	4	6
329	28	5	7
330	28	6	4
331	28	7	5
332	28	8	4
333	28	9	5
334	28	10	6
335	28	11	3
336	28	12	51
337	29	1	3
338	29	2	150
339	29	3	5
340	29	4	3
341	29	5	6
342	29	6	3
343	29	7	4
344	29	8	6
345	29	9	7
346	29	10	6
347	29	11	4
348	29	12	84
349	30	1	4
350	30	2	420
351	30	3	1
352	30	4	4
353	30	5	5
354	30	6	4
355	30	7	5
356	30	8	6
357	30	9	7
358	30	10	7
359	30	11	1
360	30	12	75
361	31	1	2
362	31	2	150
363	31	3	1
364	31	4	5
365	31	5	4
366	31	6	2
367	31	7	4
368	31	8	5
369	31	9	6
370	31	10	3
371	31	11	3
372	31	12	42
373	32	1	4
374	32	2	250
375	32	3	2
376	32	4	5
377	32	5	4
378	32	6	3
379	32	7	4
380	32	8	5
381	32	9	7
382	32	10	8
383	32	11	2
384	32	12	15
385	33	1	3
386	33	2	350
387	33	3	2
388	33	4	4
389	33	5	5
390	33	6	4
391	33	7	6
392	33	8	7
393	33	9	6
394	33	10	5
395	33	11	4
396	33	12	38
397	34	1	3
398	34	2	150
399	34	3	3
400	34	4	5
401	34	5	6
402	34	6	3
403	34	7	4
404	34	8	6
405	34	9	5
406	34	10	4
407	34	11	3
408	34	12	84
409	35	1	2
410	35	2	150
411	35	3	4
412	35	4	5
413	35	5	6
414	35	6	3
415	35	7	4
416	35	8	6
417	35	9	7
418	35	10	3
419	35	11	1
420	35	12	72
\.


--
-- TOC entry 5062 (class 0 OID 16394)
-- Dependencies: 221
-- Data for Name: du_lieu_rf; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.du_lieu_rf (ma_du_lieu, gia, chat_luong, thoi_gian_giao_hang, uy_tin, nang_luc_cung_ung, tinh_linh_hoat, dieu_kien_thanh_toan, dich_vu_ho_tro, ket_qua) FROM stdin;
\.


--
-- TOC entry 5064 (class 0 OID 16399)
-- Dependencies: 223
-- Data for Name: ket_qua_quyet_dinh; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ket_qua_quyet_dinh (ma_ket_qua, ma_ncc, diem_ahp, du_doan_rf, diem_tong, ket_luan) FROM stdin;
\.


--
-- TOC entry 5066 (class 0 OID 16404)
-- Dependencies: 225
-- Data for Name: nha_cung_cap; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nha_cung_cap (ma_ncc, ten_ncc, dia_chi, so_dien_thoai, email, mo_ta) FROM stdin;
1	NhÃ  cung cáº¥p 1	Dia chi so 1, Quan 1, TP.HCM	0900100001	ncc1@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
2	NhÃ  cung cáº¥p 2	Dia chi so 2, Quan 2, TP.HCM	0900100002	ncc2@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
3	NhÃ  cung cáº¥p 3	Dia chi so 3, Quan 3, TP.HCM	0900100003	ncc3@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
4	NhÃ  cung cáº¥p 4	Dia chi so 4, Quan 4, TP.HCM	0900100004	ncc4@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
5	NhÃ  cung cáº¥p 5	Dia chi so 5, Quan 5, TP.HCM	0900100005	ncc5@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
6	NhÃ  cung cáº¥p 6	Dia chi so 6, Quan 6, TP.HCM	0900100006	ncc6@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
7	NhÃ  cung cáº¥p 7	Dia chi so 7, Quan 7, TP.HCM	0900100007	ncc7@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
8	NhÃ  cung cáº¥p 8	Dia chi so 8, Quan 8, TP.HCM	0900100008	ncc8@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
9	NhÃ  cung cáº¥p 9	Dia chi so 9, Quan 9, TP.HCM	0900100009	ncc9@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
10	NhÃ  cung cáº¥p 10	Dia chi so 10, Quan 10, TP.HCM	0900100010	ncc10@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
11	NhÃ  cung cáº¥p 11	Dia chi so 11, Quan 11, TP.HCM	0900100011	ncc11@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
12	NhÃ  cung cáº¥p 12	Dia chi so 12, Quan 1, TP.HCM	0900100012	ncc12@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
13	NhÃ  cung cáº¥p 13	Dia chi so 13, Quan 1, TP.HCM	0900100013	ncc13@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
14	NhÃ  cung cáº¥p 14	Dia chi so 14, Quan 2, TP.HCM	0900100014	ncc14@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
15	NhÃ  cung cáº¥p 15	Dia chi so 15, Quan 3, TP.HCM	0900100015	ncc15@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
16	NhÃ  cung cáº¥p 16	Dia chi so 16, Quan 4, TP.HCM	0900100016	ncc16@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
17	NhÃ  cung cáº¥p 17	Dia chi so 17, Quan 5, TP.HCM	0900100017	ncc17@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
18	NhÃ  cung cáº¥p 18	Dia chi so 18, Quan 6, TP.HCM	0900100018	ncc18@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
19	NhÃ  cung cáº¥p 19	Dia chi so 19, Quan 7, TP.HCM	0900100019	ncc19@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
20	NhÃ  cung cáº¥p 20	Dia chi so 20, Quan 8, TP.HCM	0900100020	ncc20@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
21	NhÃ  cung cáº¥p 21	Dia chi so 21, Quan 9, TP.HCM	0900100021	ncc21@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
22	NhÃ  cung cáº¥p 22	Dia chi so 22, Quan 10, TP.HCM	0900100022	ncc22@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
23	NhÃ  cung cáº¥p 23	Dia chi so 23, Quan 11, TP.HCM	0900100023	ncc23@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
24	NhÃ  cung cáº¥p 24	Dia chi so 24, Quan 1, TP.HCM	0900100024	ncc24@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
25	NhÃ  cung cáº¥p 25	Dia chi so 25, Quan 1, TP.HCM	0900100025	ncc25@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
26	NhÃ  cung cáº¥p 26	Dia chi so 26, Quan 2, TP.HCM	0900100026	ncc26@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
27	NhÃ  cung cáº¥p 27	Dia chi so 27, Quan 3, TP.HCM	0900100027	ncc27@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
28	NhÃ  cung cáº¥p 28	Dia chi so 28, Quan 4, TP.HCM	0900100028	ncc28@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
29	NhÃ  cung cáº¥p 29	Dia chi so 29, Quan 5, TP.HCM	0900100029	ncc29@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
30	NhÃ  cung cáº¥p 30	Dia chi so 30, Quan 6, TP.HCM	0900100030	ncc30@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
31	NhÃ  cung cáº¥p 31	Dia chi so 31, Quan 7, TP.HCM	0900100031	ncc31@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
32	NhÃ  cung cáº¥p 32	Dia chi so 32, Quan 8, TP.HCM	0900100032	ncc32@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
33	NhÃ  cung cáº¥p 33	Dia chi so 33, Quan 9, TP.HCM	0900100033	ncc33@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
34	NhÃ  cung cáº¥p 34	Dia chi so 34, Quan 10, TP.HCM	0900100034	ncc34@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
35	NhÃ  cung cáº¥p 35	Dia chi so 35, Quan 11, TP.HCM	0900100035	ncc35@supplier.vn	Import tá»« supplier_ranking_grades.xlsx
\.


--
-- TOC entry 5068 (class 0 OID 16412)
-- Dependencies: 227
-- Data for Name: so_sanh_cap_ahp; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.so_sanh_cap_ahp (ma_so_sanh, tieu_chi_1, tieu_chi_2, gia_tri) FROM stdin;
\.


--
-- TOC entry 5070 (class 0 OID 16417)
-- Dependencies: 229
-- Data for Name: tieu_chi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tieu_chi (ma_tieu_chi, ten_tieu_chi, mo_ta) FROM stdin;
1	quality	Cháº¥t lÆ°á»£ng
2	quantity	Sá»‘ lÆ°á»£ng
3	conditions_and_method_of_payment	Äiá»u kiá»‡n vÃ  phÆ°Æ¡ng thá»©c thanh toÃ¡n
4	serviceability_and_communicativeness_of_the_supplier	Kháº£ nÄƒng phá»¥c vá»¥ vÃ  giao tiáº¿p cá»§a nhÃ  cung cáº¥p
5	reputation_of_the_supplier_and_its_competence	Uy tÃ­n vÃ  nÄƒng lá»±c cá»§a nhÃ  cung cáº¥p
6	flexibility	TÃ­nh linh hoáº¡t
7	financial_condition_of_the_supplier	TÃ¬nh hÃ¬nh tÃ i chÃ­nh cá»§a nhÃ  cung cáº¥p
8	condition_of_the_supplier_assets	TÃ¬nh tráº¡ng tÃ i sáº£n cá»§a nhÃ  cung cáº¥p
9	business_results_and_number_of_employees	Káº¿t quáº£ kinh doanh vÃ  sá»‘ lÆ°á»£ng nhÃ¢n viÃªn
10	price	GiÃ¡
11	delivery_time	Thá»i gian giao hÃ ng
12	supplier_location_and_traffic_connections	Vá»‹ trÃ­ vÃ  káº¿t ná»‘i giao thÃ´ng cá»§a nhÃ  cung cáº¥p
\.


--
-- TOC entry 5072 (class 0 OID 16425)
-- Dependencies: 231
-- Data for Name: trong_so_tieu_chi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trong_so_tieu_chi (ma_trong_so, ma_tieu_chi, trong_so) FROM stdin;
\.


--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 220
-- Name: danh_gia_ncc_ma_danh_gia_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.danh_gia_ncc_ma_danh_gia_seq', 420, true);


--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 222
-- Name: du_lieu_rf_ma_du_lieu_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.du_lieu_rf_ma_du_lieu_seq', 1, false);


--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 224
-- Name: ket_qua_quyet_dinh_ma_ket_qua_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ket_qua_quyet_dinh_ma_ket_qua_seq', 1, false);


--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 226
-- Name: nha_cung_cap_ma_ncc_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nha_cung_cap_ma_ncc_seq', 35, true);


--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 228
-- Name: so_sanh_cap_ahp_ma_so_sanh_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.so_sanh_cap_ahp_ma_so_sanh_seq', 1, false);


--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 230
-- Name: tieu_chi_ma_tieu_chi_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tieu_chi_ma_tieu_chi_seq', 12, true);


--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 232
-- Name: trong_so_tieu_chi_ma_trong_so_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trong_so_tieu_chi_ma_trong_so_seq', 1, false);


--
-- TOC entry 4894 (class 2606 OID 16438)
-- Name: danh_gia_ncc danh_gia_ncc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.danh_gia_ncc
    ADD CONSTRAINT danh_gia_ncc_pkey PRIMARY KEY (ma_danh_gia);


--
-- TOC entry 4896 (class 2606 OID 16440)
-- Name: du_lieu_rf du_lieu_rf_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.du_lieu_rf
    ADD CONSTRAINT du_lieu_rf_pkey PRIMARY KEY (ma_du_lieu);


--
-- TOC entry 4898 (class 2606 OID 16442)
-- Name: ket_qua_quyet_dinh ket_qua_quyet_dinh_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ket_qua_quyet_dinh
    ADD CONSTRAINT ket_qua_quyet_dinh_pkey PRIMARY KEY (ma_ket_qua);


--
-- TOC entry 4900 (class 2606 OID 16444)
-- Name: nha_cung_cap nha_cung_cap_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nha_cung_cap
    ADD CONSTRAINT nha_cung_cap_pkey PRIMARY KEY (ma_ncc);


--
-- TOC entry 4902 (class 2606 OID 16446)
-- Name: so_sanh_cap_ahp so_sanh_cap_ahp_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.so_sanh_cap_ahp
    ADD CONSTRAINT so_sanh_cap_ahp_pkey PRIMARY KEY (ma_so_sanh);


--
-- TOC entry 4904 (class 2606 OID 16448)
-- Name: tieu_chi tieu_chi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tieu_chi
    ADD CONSTRAINT tieu_chi_pkey PRIMARY KEY (ma_tieu_chi);


--
-- TOC entry 4906 (class 2606 OID 16450)
-- Name: trong_so_tieu_chi trong_so_tieu_chi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trong_so_tieu_chi
    ADD CONSTRAINT trong_so_tieu_chi_pkey PRIMARY KEY (ma_trong_so);


--
-- TOC entry 4907 (class 2606 OID 16451)
-- Name: danh_gia_ncc danh_gia_ncc_ma_ncc_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.danh_gia_ncc
    ADD CONSTRAINT danh_gia_ncc_ma_ncc_fkey FOREIGN KEY (ma_ncc) REFERENCES public.nha_cung_cap(ma_ncc);


--
-- TOC entry 4908 (class 2606 OID 16456)
-- Name: danh_gia_ncc danh_gia_ncc_ma_tieu_chi_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.danh_gia_ncc
    ADD CONSTRAINT danh_gia_ncc_ma_tieu_chi_fkey FOREIGN KEY (ma_tieu_chi) REFERENCES public.tieu_chi(ma_tieu_chi);


--
-- TOC entry 4909 (class 2606 OID 16461)
-- Name: ket_qua_quyet_dinh ket_qua_quyet_dinh_ma_ncc_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ket_qua_quyet_dinh
    ADD CONSTRAINT ket_qua_quyet_dinh_ma_ncc_fkey FOREIGN KEY (ma_ncc) REFERENCES public.nha_cung_cap(ma_ncc);


--
-- TOC entry 4910 (class 2606 OID 16466)
-- Name: so_sanh_cap_ahp so_sanh_cap_ahp_tieu_chi_1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.so_sanh_cap_ahp
    ADD CONSTRAINT so_sanh_cap_ahp_tieu_chi_1_fkey FOREIGN KEY (tieu_chi_1) REFERENCES public.tieu_chi(ma_tieu_chi);


--
-- TOC entry 4911 (class 2606 OID 16471)
-- Name: so_sanh_cap_ahp so_sanh_cap_ahp_tieu_chi_2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.so_sanh_cap_ahp
    ADD CONSTRAINT so_sanh_cap_ahp_tieu_chi_2_fkey FOREIGN KEY (tieu_chi_2) REFERENCES public.tieu_chi(ma_tieu_chi);


--
-- TOC entry 4912 (class 2606 OID 16476)
-- Name: trong_so_tieu_chi trong_so_tieu_chi_ma_tieu_chi_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trong_so_tieu_chi
    ADD CONSTRAINT trong_so_tieu_chi_ma_tieu_chi_fkey FOREIGN KEY (ma_tieu_chi) REFERENCES public.tieu_chi(ma_tieu_chi);


-- Completed on 2026-03-20 13:16:09

--
-- PostgreSQL database dump complete
--

\unrestrict RQWo1JTJDaVjG1LtFc8COVdZDow0XVqvD7FNSjN0xGlmm6HchGSWk8VRaX4kVLt

