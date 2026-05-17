import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const EXAM_DATE = new Date("2026-11-15");
const TARGET_Q = 15000;
const DAILY_MIN = 80;
const VESP_DAYS = 30;
const GRANDES_AREAS = ["Clínica Médica","Clínica Cirúrgica","Pediatria","Ginecologia e Obstetrícia","Preventiva & Social"];

const AREA_COLOR = {
  "Clínica Médica":"#6366f1","Clínica Cirúrgica":"#f59e0b",
  "Pediatria":"#10b981","Ginecologia e Obstetrícia":"#ec4899","Preventiva & Social":"#14b8a6"
};
const AREA_BG = {
  "Clínica Médica":"#eef2ff","Clínica Cirúrgica":"#fffbeb",
  "Pediatria":"#ecfdf5","Ginecologia e Obstetrícia":"#fdf2f8","Preventiva & Social":"#f0fdfa"
};
const AREA_ICON = {
  "Clínica Médica":"🫀","Clínica Cirúrgica":"🔪","Pediatria":"🧸",
  "Ginecologia e Obstetrícia":"🌸","Preventiva & Social":"📋"
};

// ─────────────────────────────────────────────
// PREVALENCE LIST (from user)
// ─────────────────────────────────────────────
const PREV_ORDER = [
  "Asma (Questões)","Câncer Colorretal","Hérnias Inguinocrurais","Saúde do Trabalhador","Contracepção (Questões)",
  "Hemorragia Digestiva Alta","Cardiopatias Congênitas (Questões)","Código de Ética Médica","Glomerulopatias (Questões)",
  "Trauma Torácico","Pancreatite Aguda","SUS (Questões)","Síndrome Coronariana Aguda (Questões)","Choque Hemorrágico",
  "Sepse e Choque Séptico","PALS","Abdome Agudo Obstrutivo","Doença Inflamatória Intestinal","Bronquiolite","Queimaduras",
  "Câncer de Estômago","Apendicite","Tromboembolismo Pulmonar","Cirurgia Bariátrica e Metabólica","Artrites (Questões)",
  "Distúrbios Ácido-Base","Vigilância Epidemiológica","Meningites em Crianças","AVC isquêmico (Questões)",
  "Doenças Exantemáticas (Questões)","Doença Falciforme","Diarreia (Questões)","Estudos Epidemiológicos",
  "Aleitamento Materno","Trauma Abdominal e Diafragmático","Anemia Ferropriva no Adulto e na Criança",
  "Calendário Vacinal - Criança & Adulto & Idoso","Colecistite","Cuidados Paliativos",
  "Cetoacidose Diabética e Estado Hiperglicêmico Hiperosmolar","Distúrbios do Potássio — Abordagem",
  "Hipertensão no Adulto","Climatério e Menopausa","TCE Grave e Herniação Cerebral","Dengue","Pré-Eclâmpsia",
  "Infecção de Sítio Cirúrgico e Antibioticoprofilaxia","Hiponatremia","Testes Diagnósticos","Febre Reumática",
  "ITU na Criança","Hiperplasia Adrenal Congênita","Pneumonia na Criança","Adaptações & Queixas da Gestação",
  "Melanoma","Nutrição Perioperatória","Pneumonia Adquirida na Comunidade","Doença Renal Crônica",
  "Parasitoses (Questões)","Distúrbios do Cortisol (Questões)","Ventilação Mecânica","Derrame Pleural",
  "Taquiarritmias (Questões)","Dislipidemia","Incontinência Urinária","Alergia Alimentar","Neoplasias Pediátricas",
  "Leucemias (questões)","Cicatrização de Feridas","DPOC – Diagnóstico e Tratamento","Reanimação Neonatal",
  "Injúria Renal Aguda","Gestação Ectópica","Insuficiência Cardíaca – Ambulatorial","Declaração de Óbito",
  "Endometriose","Cefaleias (Questões)","Endocardite Infecciosa","Avaliação do DNPM",
  "Imobilização Cervical e Via Aérea no Trauma","Atributos da APS","HIV (Questões)","Avaliação Pôndero-Estatural",
  "Fisiologia Menstrual","Tumores Neuroendócrinos","Diabetes Mellitus Gestacional","Câncer de Mama",
  "Hiperplasia e Câncer de Endométrio","Políticas e Protocolos","Política Nacional de Atenção Básica",
  "Doença do Refluxo Gastroesofágico","Infertilidade - Tratamento","Cardiotocografia","Trauma Esplênico",
  "Testes de Triagem Neonatal","Vasculite por IgA","Diverticulite","Síndrome dos Ovários Policísticos",
  "Nódulos Tireoidianos","Megaesôfago & Megacólon Chagásico","Câncer de Pulmão",
  "Doenças Túbulo-Intersticiais (Questões)","Hipertireoidismo","Carcinoma Hepatocelular","Câncer de Esôfago",
  "Prolapso de Órgãos Pélvicos","REMIT","Nefrolitíase","Abdome Agudo Perfurativo",
  "Avaliação da Amenorreia Primária","DM 2 - Tratamento sem Insulina","Distúrbios do Cálcio","Abuso Infantil",
  "Prevenção e Promoção da Saúde","Divertículo de Meckel","Transtorno do Espectro Autista (TEA)",
  "Aloimunização Rh","Abdome Agudo Vascular","Ascite","Doenças Desmielinizantes (Questões)",
  "Hemorragia Pós-Parto","Avaliação Inicial no Trauma","Câncer de Tireoide","COVID-19","Cardiomiopatias",
  "Rastreio do Câncer de Colo","Câncer de Ovário","Infecção do Trato Urinário","Anafilaxia","Fibrilação Atrial",
  "Meningites","Leishmaniose","Fibrose Cística","Anestesia Local","Lúpus Eritematoso Sistêmico",
  "Icterícia Neonatal (Questões)","Doença Hemorroidária","Hepatite B","Hipertensão Arterial Sistêmica na Criança",
  "Infecções de Pele e Partes Moles (Questões)","Diálise","Lesões Benignas da Mama",
  "Emergências Oncológicas (Questões)","Avaliação das Doenças Pulmonares Intersticiais","Coledocolitíase",
  "Farmacodermias (Questões)","Hemorragia Digestiva Baixa","Sífilis na Gestação","Assistência Pré-Natal",
  "Trauma na Criança","Anemias Hemolíticas (Questões)","Intussuscepção Intestinal",
  "Púrpura Trombocitopênica Imune (PTI)","Trabalho de Parto Prematuro","Mieloma Múltiplo",
  "Hipertensão Pulmonar","Leiomioma","Trauma Cervical","Câncer de Cabeça e Pescoço","Divertículos Esofágicos",
  "Tumores Císticos do Pâncreas","Complicações Crônicas do DM (Questões)","Trombose Venosa Profunda",
  "Manejo de Intoxicações (Questões)","Gestação Múltipla","Hipertensão Portal","Câncer de Próstata",
  "Convulsão Febril","Vitaminas & Minerais na Puericultura","Descolamento Prematuro de Placenta","Sífilis",
  "Neoplasias da Via Biliar (Questões)","Artrite Reumatoide","Câncer de Pâncreas Exócrino",
  "Aneurismas de Aorta Abdominal","Hipotireoidismo","Insuficiência Cardíaca – Descompensação",
  "Medidas de Associação","Partograma","Lúpus Eritematoso Sistêmico Juvenil","Placenta Prévia","Trauma Pélvico",
  "Trauma de Uretra & Bexiga & Ureter","Método Clínico Centrado na Pessoa","ACLS",
  "Epilepsia e Crises Epilépticas e Estado de Mal","Linfomas","Estática Fetal","Distócias",
  "Doença Trofoblástica Gestacional","Trauma de Extremidades","Colangite Aguda","Doença Inflamatória Pélvica",
  "Dermatite Atópica","DPOC – Exacerbações","Fístulas do Trato Gastrointestinal","Doença Celíaca",
  "Sífilis Congênita","Bioestatística","Transtorno do Déficit de Atenção e Hiperatividade",
  "Assistência ao Trabalho de Parto","Tuberculose Miliar e Extrapulmonar",
  "Colecistectomia e Lesões da Via Biliar","Anemia Megaloblástica","Criptorquidia",
  "Síndrome Hemolítico-Urêmica","Osteoporose","Toxoplasmose na Gestação","Rastreio do Câncer de Mama",
  "Miastenia Gravis","Obesidade e Síndrome Metabólica","Displasia do Desenvolvimento do Quadril",
  "Doença Hepática Esteatótica Associada à Disfunção Metabólica","Reações Transfusionais (Questões)",
  "Doença de Kawasaki","Doença de Parkinson","Antibióticos (Questões)","Úlcera Péptica",
  "Cuidados de Sala de Parto & Alojamento Conjunto","Sarampo","Abscesso e Fístula Anorretal","Hanseníase",
  "Rotura Prematura de Membranas Ovulares","Restrição de Crescimento Intrauterino","Fórceps",
  "Tumores Hepáticos Benignos","Síndrome de Guillain-Barré","Espondiloartrites",
  "Estenose Hipertrófica de Piloro","Pneumotórax","Mão-Pé-Boca & Herpangina",
  "Dissecção de Aorta e Outras Síndromes Aórticas","Síndrome Coronariana Crônica","Pericardite Aguda",
  "Hepatite C","Faringite Aguda","Cirrose","Vacinas da Gestante","Fios & Suturas",
  "Cirurgia Minimamente Invasiva","Abortamento","Avaliação de SUA","Vaginose Bacteriana","Tireoidectomia",
  "Refluxo Gastroesofágico na Criança","Anticoagulação e sua Reversão","Delirium","Nefrite Lúpica",
  "Alterações da Puberdade","Avaliação Pré-Operatória","Álcool","Trauma Hepático","Trauma Renal",
  "Hiperprolactinemia","Fibromialgia","Desconforto respiratório do RN (Questões)",
  "Bradiarritmias (Questões)","Doença Arterial Obstrutiva Periférica","Acidentes Ofídicos",
  "Puberdade Fisiológica","Segurança da Criança","AIDS e Profilaxias de Oportunistas",
  "Peritonite Bacteriana Espontânea","Dopplervelocitometria e Perfil Biofísico Fetal",
  "Conceitos em Pesquisa Clínica","Câncer de Testículo","Indução do Parto",
  "Diagnóstico & Datação da Gestação","Infecções Puerperais","Trauma Vertebral e Raquimedular",
  "Síndrome de Down","Rastreamento de Cromossomopatias (Questões)",
  "Granulomatose com Poliangeíte & Poliangeíte Microscópica","Colelitíase e Colecistolitíase",
  "Avaliação da Amenorreia Secundária","Sarcoidose","Dispepsia","Oclusão Arterial Aguda",
  "Mordedura de Animais","Idoso Frágil & Polifarmácia","Doenças Clínicas na Gestação",
  "Síndrome Gripal & SRAG","ITU na Gestação","Síndrome Hepatorrenal","Torcicolo Congênito","Adenomiose",
  "Infecção de Corrente Sanguínea associada à Cateter","Trauma Gastrointestinal","Priapismo",
  "Arterite de Células Gigantes","Abordagem Familiar e Comunitária","Sarcomas",
  "Hipertensão — Urgências e Emergências","Hiperaldosteronismo Primário","Incidentaloma Adrenal",
  "HIV na Gestação","Síncope","Distúrbios do Sono","Apneia Obstrutiva do Sono",
  "Avaliação do Paciente com Demência","Doença Hirschsprung","Sepse Neonatal","DM 2 - Insulina",
  "Corpo Estranho na Pediatria","Fissura Anal","Câncer Anal","Hipertensão Arterial Sistêmica Secundária (Questões)",
  "Otite Média Aguda em Crianças","Coqueluche","Bronquiectasia","Suicídio","Artrite Idiopática Juvenil",
  "Doença de Alzheimer","Tuberculose na Criança","Afecções Testiculares","Avaliação da Vertigem",
  "Tricomoníase","Atresia de Esôfago e Fístulas Traqueoesofágicas","Esclerose Sistêmica","Doença de Sjögren",
  "Distúrbios Metabólicos do RN (Questões)","Síndrome do Intestino Irritável","Pancreatite Crônica",
  "Hemofilia","Síndrome Colinérgica & Intoxicação por Carbamatos/Organofosforados","Hepatite Alcoólica",
  "Eclâmpsia","Febre Sem Sinais Localizatórios & de Origem Indeterminada","Câncer de Bexiga",
  "Neoplasias da Vulva","Tabagismo","Antidepressivos e Ansiolíticos",
  "Antipsicóticos e Antiepilépticos e Estabilizadores do Humor","Demência Frontotemporal",
  "Cirurgia de Controle de Danos","Hiperplasia Prostática Benigna",
  "Cervicite & Uretrite & Epididimite & Proctite","Urticária","Dermatomiosite e Polimiosite",
  "Deiscência de Anastomose Duodenal","DM 2 - Clínica e Diagnóstico","Constipação",
  "Síndrome do Anticorpo Antifosfolípide","Doença de von Willebrand","Insuficiência Venosa Crônica",
  "Intoxicação por Paracetamol","Hepatite A","Síndrome HELLP","Hipotireoidismo Subclínico",
  "Síndrome do Desconforto Respiratório Agudo","Outras Infecções na Gestação","Febre Maculosa",
  "Morte Encefálica","Mielopatias","Outras Gamopatias Monoclonais","Doença de Osgood-Schlatter",
  "Transplante Hepático","Herpes-Zóster","Acesso Venoso Central","Pneumonia Associada ao Ventilador",
  "Anemia da Doença Crônica","Talassemias","Chikungunya","Carcinoma Basocelular","H. pylori",
  "Malformações de Vias Urinárias","Massas Mediastinais (Questões)","Hipoglicemia","Profilaxia do Tétano",
  "Toxoplasmose Congênita","Crupe","Malária","Policitemia Vera","Colangite Biliar Primária","Varíola","Mpox",
  "Ostomias","Transtornos Depressivos","Pólipo Uterino","Trauma Retroperitoneal","Erros Inatos do Metabolismo",
  "Vacinas do HPV","Candidíase Vaginal","Enxertos e Retalhos","Úlceras Por Pressão",
  "Síndrome Compartimental Abdominal","Febre e Atelectasia no Pós-Operatório","Alterações Cutâneas do RN",
  "Taquipneia Transitória do RN","Diabetes Mellitus Tipo 1","Púrpura Trombocitopênica Trombótica (PTT)",
  "Distúrbios da Vitamina D","Valvopatias (Questões)","Síndrome Compartimental",
  "Doenças da Tireoide na Gestação","Insuficiência Istmo-Cervical","Leptospirose","Paracoccidioidomicose",
  "Tumores Renais","Esclerose Lateral Amiotrófica","Dermatoses da Vulva","Síndromes Mielodisplásicas",
  "Distúrbios da Audição","Hemocromatose Hereditária","Cesárea","Complicações da Prematuridade",
  "Hidrocefalia de Pressão Normal","Políticas de Saúde Mental","Coagulação Intravascular Disseminada (CIVD)",
  "Trombofilia","Hipernatremia","Varicela","Exantema Súbito","Estenose de Carótidas","Acidente Escorpiônico",
  "Distúrbios do GH","Insuficiência Hepática Aguda","Abscesso Hepático","Paralisia de Bell",
  "Colangite Esclerosante Primária","Fases do Trabalho de Parto","Parto Pélvico","Displasia Broncopulmonar",
  "Êmese e Hiperêmese Gravídica","Trauma na Gestante","Trauma de Face","Pentavalente e DTP",
  "Tríplice Viral & Varicela & Herpes-Zóster","Vaginose Citolítica","Rinite Alérgica","Febre Amarela",
  "Projeto Terapêutico Singular","AVC hemorrágico (Questões)","Nódulos Cervicais (Questões)","Atresia Intestinal",
  "Distúrbios do Magnésio","Parvovírus B19 & Eritema Infeccioso","Epidemiologia Brasileira (Questões)",
  "Síndrome da Embolia Gordurosa","Outras Hérnias","Hipopituitarismo","Hipoxemia",
  "Mononucleose & Epstein Barr","Encefalite Herpética","Paralisia Cerebral","Massas Anexiais Benignas",
  "Lombalgia","Radiculopatias","Osteomielite em Adultos","Enterocolite Necrosante","Esquizofrenia & Psicose",
  "Rotura Uterina","Dismenorreia","Vacinas do Pneumococo & Meningococo","Porfirias","Carcinoma Espinocelular",
  "Disfagia","Gastrosquise e Onfalocele","Polimialgia Reumática","Seroma & Hematoma & Deiscência",
  "Eritema Nodoso","Dermatoses Parasitárias (Questões)","Síndrome do Desconforto Respiratório do RN",
  "Rubéola","Miocardite","Endemia & Epidemia & Pandemia","Intoxicação por Opioides",
  "Rinossinusite em Crianças","Encefalopatia Hepática","Transplante Renal","Corioamnionite","Pós-Datismo",
  "Óbito Fetal","Aspergilose Invasiva","Câncer de Colo Invasivo","Doença de Wilson","Direitos da Gestante",
  "Protocolo de Cirurgia Segura","Transtornos Alimentares","Violência Sexual e Aborto Induzido","Afogamento",
  "Vulvovaginites em Crianças","Sequência Rápida de Intubação","Dermatite de Fralda","Escarlatina",
  "Saúde Coletiva","Intoxicação por Benzodiazepínicos","Hérnias da Infância","Infecção pelo Zika Vírus Congênita",
  "Doença de Chagas","Tumores Ósseos Benignos","Epistaxe","Febre Tifoide","Tétano","Tosse Crônica",
  "Profilaxia de Estrepto B","Fármacos na Gestação","Enurese Noturna","Modificações Fisiológicas do Puerpério",
  "Síndrome PFAPA","Segurança do Profissional da Saúde","Demência por Corpúsculos de Lewy","Choque Elétrico",
  "Hipotireoidismo Congênito","Vacina do Rotavírus","Doença Diverticular","Síndrome Pré-Menstrual","Zika",
  "Malformações Anorretais","Traqueomalácia","Doença Relacionada ao IgG4","Classificação do Recém-Nascido",
  "Psoríase","Pênfigo","Asfixia Perinatal","Acidentes com Aracnídeos","Síndrome Adrenérgica",
  "Síndrome Anticolinérgica","Atendimento ao Idoso Vítima de Violência","Hepatite Autoimune",
  "Toxoplasmose no Adulto","Difteria","Hantavirose","Amiloidose","Esporotricose","Glaucoma",
  "Metabolismo da Bilirrubina e Icterícias não-obstrutivas","Raiva Humana","Transtornos de Ansiedade",
  "Transtorno Afetivo Bipolar","Vasa Prévia","Tremor Essencial","Trauma no Idoso","Poliarterite Nodosa",
  "Behçet e Tromboangeíte Obliterante (Questões)","Sistema Imune","Síndrome de Turner","Esofagites",
  "Malformações Broncopulmonares","Fimose e Parafimose","Hipospádia e Fimose (Questões)","Dermatite de Contato",
  "Acne","Pitiríase Versicolor","Dermatoses Virais (Questões)","Hipertensão Pulmonar Persistente do RN",
  "Diabetes Monogênico","Intoxicação por Lítio","Infecção pelo Citomegalovírus Congênita","Poliomielite",
  "Câncer de Pênis","BRUE","Abrasão Corneana e Corpo Estranho","Catarata","Doenças da Pálpebra",
  "Osteogênese Imperfeita","Transtornos de Personalidade","Transtornos Somáticos","Infecção por C. difficile",
  "Demência Vascular","Demências Infecciosas","Discinesia Ciliar Primária","Tuberculose Pulmonar (Questões)",
  "Vacinas das Hepatites","Cisto & Abscesso da Glândula de Bartholin"
];

const RAW_MODULES = [
  // CLÍNICA MÉDICA
  { name:"Asma & DPOC — Parte 1", area:"Clínica Médica", topics:["Manejo Ambulatorial da Asma","Exacerbação da Asma","Asma (Questões)","DPOC – Definição e Fisiopatologia","DPOC – Diagnóstico e Tratamento"] },
  { name:"Asma & DPOC — Parte 2", area:"Clínica Médica", topics:["DPOC – Exacerbações","Espirometria (Multimídia)","Aspergilose Broncopulmonar Alérgica"] },
  { name:"Dor Torácica — Parte 1", area:"Clínica Médica", topics:["Síndrome Coronariana Aguda – Fisiopatologia & Diagnóstico","Síndrome Coronariana Aguda – Terapia de Reperfusão","Síndrome Coronariana Aguda – Princípios do Tratamento","Síndrome Coronariana Aguda (Questões)","Síndrome Coronariana Crônica"] },
  { name:"Dor Torácica — Parte 2", area:"Clínica Médica", topics:["Angiografia Coronária (Multimídia)","Oclusão Coronariana Aguda (Multimídia)","Pericardite Aguda","Miocardite","ECG Intermediário (Multimídia)"] },
  { name:"Distúrbios do Ritmo — Parte 1", area:"Clínica Médica", topics:["ACLS","BLS","PALS","Fibrilação Atrial","Bloqueio Atrioventricular","Taquiarritmias (Questões)"] },
  { name:"Distúrbios do Ritmo — Parte 2", area:"Clínica Médica", topics:["Flutter Atrial","Taquicardia por Reentrada Atrioventricular","Taquicardia por Reentrada Nodal","Taquicardia Ventricular Monomórfica","Bradiarritmias (Questões)","ECG Avançado (Multimídia)"] },
  { name:"Insuficiência Cardíaca", area:"Clínica Médica", topics:["Insuficiência Cardíaca – Ambulatorial","Insuficiência Cardíaca – Descompensação","Temas Avançados de Insuficiência Cardíaca","ECG Básico (Multimídia)","Síncope","Amiloidose","Cardiomiopatias"] },
  { name:"Doenças Valvares — Parte 1", area:"Clínica Médica", topics:["Febre Reumática","Endocardite Infecciosa","Insuficiência Aórtica","Estenose Aórtica","Estenose Mitral"] },
  { name:"Doenças Valvares — Parte 2", area:"Clínica Médica", topics:["Insuficiência Mitral","Valvopatias Tricúspides e Pulmonares","Valvopatias (Questões)","Fonocardiograma (Multimídia)","Semiologia Cardiovascular (Multimídia)"] },
  { name:"Hipertensão & Dislipidemia — Parte 1", area:"Clínica Médica", topics:["Hipertensão no Adulto","Hipertensão — Urgências e Emergências","Hipertensão Renovascular","Hiperaldosteronismo Primário"] },
  { name:"Hipertensão & Dislipidemia — Parte 2", area:"Clínica Médica", topics:["Feocromocitoma & Paraganglioma","Hipertensão Arterial Sistêmica Secundária (Questões)","Hipertensão Arterial Sistêmica na Criança","Dislipidemia"] },
  { name:"Hipoxemia", area:"Clínica Médica", topics:["Síndrome do Desconforto Respiratório Agudo","Hipoxemia","Ventilação Mecânica","Tromboembolismo Pulmonar"] },
  { name:"Glomerulopatias — Parte 1", area:"Clínica Médica", topics:["Síndrome Nefrótica","Síndrome Nefrótica na Pediatria","Nefropatia por IgA","Nefropatia Membranosa","Glomerulonefrite Membranoproliferativa","Glomerulonefrite Rapidamente Progressiva (GNRP)","Glomeruloesclerose Segmentar e Focal (GESF)"] },
  { name:"Glomerulopatias — Parte 2", area:"Clínica Médica", topics:["Doença de Lesões Mínimas","Síndrome Nefrítica","Glomerulonefrite Pós-Estreptocóccica (GNPE)","Nefrite Intersiticial Aguda","Tubulopatias","Doenças Túbulo-Intersticiais (Questões)","Nefrite Lúpica","Nefropatia associada ao HIV","Doença da Membrana Fina","Síndrome de Alport","Nefroesclerose Hipertensiva","Urinálise","Glomerulopatias (Questões)"] },
  { name:"Insuficiência Renal", area:"Clínica Médica", topics:["Injúria Renal Aguda","Diálise","Transplante Renal","Doença Renal Crônica"] },
  { name:"Insuficiência Hepática — Parte 1", area:"Clínica Médica", topics:["Peritonite Bacteriana Espontânea","Encefalopatia Hepática","Hipertensão Portal","Ascite"] },
  { name:"Insuficiência Hepática — Parte 2", area:"Clínica Médica", topics:["Síndrome Hepatorrenal","Cirrose","Insuficiência Hepática Aguda"] },
  { name:"Hepatites", area:"Clínica Médica", topics:["Hepatite C","Hepatite B","Hepatite A","Lesão Hepática Induzida por Drogas","Hepatite Autoimune","Hepatite Alcoólica"] },
  { name:"Outras Hepatopatias", area:"Clínica Médica", topics:["Doença de Wilson","Hemocromatose Hereditária","Transplante Hepático","Colangite Biliar Primária","Colangite Esclerosante Primária","Doença Hepática Esteatótica Associada à Disfunção Metabólica","Metabolismo da Bilirrubina e Icterícias não-obstrutivas"] },
  { name:"Diarreia & Constipação — Parte 1", area:"Clínica Médica", topics:["Diarreia Aguda - Fisiopatologia","Diarreia Aguda - Abordagem","Diarreia (Questões)","Doença Inflamatória Intestinal","Constipação","Doença Celíaca"] },
  { name:"Diarreia & Constipação — Parte 2", area:"Clínica Médica", topics:["Síndrome do Intestino Irritável","Gastroparesia","SIBO","Pancreatite Crônica","Dispepsia","Semiologia Abdominal (Multimídia)"] },
  { name:"Neurologia — Parte 1: Urgências", area:"Clínica Médica", topics:["Epilepsia e Crises Epilépticas e Estado de Mal","Convulsão Febril","Trombose Venosa Cerebral","Mielopatias","Semiologia Neurológica (Multimídia)"] },
  { name:"Neurologia — Parte 2: Doenças Neuromusculares", area:"Clínica Médica", topics:["Miastenia Gravis","Síndrome Miastênica de Eaton-Lambert","Síndrome de Guillain-Barré","Esclerose Lateral Amiotrófica","Esclerose Múltipla","Doenças Desmielinizantes (Questões)"] },
  { name:"Neurologia — Parte 3: Miscelânea", area:"Clínica Médica", topics:["Paralisia de Bell","Distúrbios do Sono"] },
  { name:"AVC — Parte 1", area:"Clínica Médica", topics:["AVC — Epidemiologia e Patogênese","AVC isquêmico (Questões)","AVC — Escalas e Neuroimagem","Manejo do AVC isquêmico"] },
  { name:"AVC — Parte 2", area:"Clínica Médica", topics:["Hemorragia Subaracnoide","Hemorragia Intraventricular e Intracerebral","AVC hemorrágico (Questões)"] },
  { name:"Cefaleias e Algias Cranianas — Parte 1", area:"Clínica Médica", topics:["Cefaleia do Tipo Tensão","Cefaleias - Migrânea","Cefaleias - Trigêmino-Autonômicas","Cefaleias (Questões)","Neuralgia do Trigêmeo"] },
  { name:"Cefaleias e Algias Cranianas — Parte 2", area:"Clínica Médica", topics:["Cefaleia Cervicogênica","Cefaleia Hípnica","Cefaleia por uso Excessivo de Medicamentos","Síndrome de Vasoconstrição Cerebral Reversível","Hipertensão Intracraniana Idiopática","Síndrome de Encefalopatia Posterior Reversível (PRES)"] },
  { name:"Transtornos do Movimento", area:"Clínica Médica", topics:["Doença de Parkinson","Distonia & Discinesia Tardia","Conceitos sobre Transtornos do Movimento","Tremor Essencial","Doença de Huntington","Atrofia de Múltiplos Sistemas","Degeneração Corticobasal","Paralisia Supranuclear Progressiva"] },
  { name:"Síndromes Demenciais", area:"Clínica Médica", topics:["Avaliação do Paciente com Demência","Demência Vascular","Doença de Alzheimer","Demência Frontotemporal","Demência por Corpúsculos de Lewy","Demências Infecciosas","Hidrocefalia de Pressão Normal"] },
  { name:"Psiquiatria — Parte 1: Transtornos Comuns", area:"Clínica Médica", topics:["Transtornos de Ansiedade","Transtornos Depressivos","Transtorno Afetivo Bipolar","Esquizofrenia & Psicose","Suicídio","Álcool"] },
  { name:"Psiquiatria — Parte 2: Outros", area:"Clínica Médica", topics:["Transtornos de Personalidade","Transtornos Alimentares","Antidepressivos e Ansiolíticos","Antipsicóticos e Antiepilépticos e Estabilizadores do Humor","Transtornos Somáticos","Síndrome de Burnout"] },
  { name:"Hipófise & Tireoide & Adrenal — Parte 1", area:"Clínica Médica", topics:["Insuficiência Adrenal","Incidentaloma Adrenal","Síndrome de Cushing","Distúrbios do Cortisol (Questões)","Hipopituitarismo","Distúrbios do GH"] },
  { name:"Hipófise & Tireoide & Adrenal — Parte 2", area:"Clínica Médica", topics:["Hipertireoidismo","Hipotireoidismo Subclínico","Hipotireoidismo","Tireoidopatias (Multimídia)"] },
  { name:"Diabetes Mellitus Tipo 2", area:"Clínica Médica", topics:["DM 2 - Clínica e Diagnóstico","DM 2 - Tratamento sem Insulina","DM 2 - Insulina"] },
  { name:"Diabetes Mellitus Tipo 1 & Monogênico", area:"Clínica Médica", topics:["Diabetes Mellitus Tipo 1","Diabetes Monogênico"] },
  { name:"Complicações Agudas do DM", area:"Clínica Médica", topics:["Cetoacidose Diabética e Estado Hiperglicêmico Hiperosmolar","Hipoglicemia"] },
  { name:"Complicações Crônicas do DM", area:"Clínica Médica", topics:["Neuropatia Diabética","Retinopatia Diabética","Doença Renal Diabética","Pé Diabético","Complicações Crônicas do DM (Questões)"] },
  { name:"Obesidade & Síndrome Metabólica", area:"Clínica Médica", topics:["Cirurgia Bariátrica e Metabólica","Obesidade e Síndrome Metabólica","Apneia Obstrutiva do Sono"] },
  { name:"Doenças do Metabolismo Ósseo", area:"Clínica Médica", topics:["Distúrbios da Vitamina D","Distúrbios do Magnésio","Hiperparatireoidismo Primário","Osteoporose","Distúrbios do Cálcio"] },
  { name:"Distúrbios Hidroeletrolíticos & Ácido-Base", area:"Clínica Médica", topics:["Distúrbios do Potássio — Fisiopatologia","Hiponatremia","Hipernatremia","Distúrbios do Potássio — Abordagem","Distúrbios Ácido-Base"] },
  { name:"Artrites", area:"Clínica Médica", topics:["Artrite Reumatoide","Espondiloartrites","Artrite Psoriásica","Osteoartrite","Artrite Séptica","Gota","Artrites (Questões)"] },
  { name:"Colagenoses — Parte 1", area:"Clínica Médica", topics:["Lúpus Eritematoso Sistêmico","Esclerose Sistêmica","Doença de Sjögren","Dermatomiosite e Polimiosite","Polimialgia Reumática"] },
  { name:"Colagenoses — Parte 2", area:"Clínica Médica", topics:["Sarcoidose","Fibromialgia","Doença Mista do Tecido Conjuntivo","Doença Relacionada ao IgG4","Manifestações Reumatológicas (Multimídia)"] },
  { name:"Vasculites", area:"Clínica Médica", topics:["Arterite de Takayasu","Arterite de Células Gigantes","Poliarterite Nodosa","Vasculite por IgA","Granulomatose Eosinofílica com Poliangeíte","Granulomatose com Poliangeíte & Poliangeíte Microscópica","Tromboangeíte Obliterante","Doença de Behçet","Behçet e Tromboangeíte Obliterante (Questões)"] },
  { name:"Distúrbios da Hemostasia — Parte 1", area:"Clínica Médica", topics:["Púrpura Trombocitopênica Trombótica (PTT)","Púrpura Trombocitopênica Imune (PTI)","Coagulação Intravascular Disseminada (CIVD)","Trombofilia","Síndrome do Anticorpo Antifosfolípide"] },
  { name:"Distúrbios da Hemostasia — Parte 2", area:"Clínica Médica", topics:["Hemofilia","Anticoagulação e sua Reversão","Doença de von Willebrand","Síndrome Hemolítico-Urêmica"] },
  { name:"Anemias Carenciais", area:"Clínica Médica", topics:["Conceitos Gerais de Anemia","Anemia Ferropriva no Adulto e na Criança","Anemia da Doença Crônica","Anemia Megaloblástica"] },
  { name:"Anemias Hemolíticas — Parte 1", area:"Clínica Médica", topics:["Anemia Sideroblástica","Anemias Autoimunes","Esferocitose Hereditária","Deficiência de G6PD","Introdução às Hemoglobinopatias","Talassemias","Doença Falciforme"] },
  { name:"Anemias Hemolíticas — Parte 2", area:"Clínica Médica", topics:["Interpretação do Hemograma (Multimídia)","Esfregaço de Sangue Periférico (Multimídia)","Porfirias","Hemoglobinúria Paroxística Noturna","Anemias Hemolíticas (Questões)"] },
  { name:"Oncohematologia — Parte 1: Leucemias & Linfomas", area:"Clínica Médica", topics:["Leucemias Mieloides","Leucemias Linfoides","Linfomas","Leucemias (Questões)","Mieloma Múltiplo","Outras Gamopatias Monoclonais"] },
  { name:"Oncohematologia — Parte 2: Síndromes Mieloproliferativas & Emergências", area:"Clínica Médica", topics:["Trombocitemia Essencial","Síndromes Mielodisplásicas","Mielofibrose Primária","Policitemia Vera","Neutropenia Febril","Síndrome de Lise Tumoral","Emergências Oncológicas (Questões)"] },
  { name:"Reações Transfusionais", area:"Clínica Médica", topics:["Reações Febris Não-Hemolíticas","Reações Hemolíticas","TRALI e TACO","Reações Transfusionais (Questões)"] },
  { name:"HIV e Infecções Oportunistas — Parte 1", area:"Clínica Médica", topics:["HIV — Clínica & Diagnóstico","HIV — Manejo","HIV — PEP e PrEP","HIV-TB e Reconstituição Imune","AIDS e Profilaxias de Oportunistas","HIV (Questões)"] },
  { name:"HIV e Infecções Oportunistas — Parte 2", area:"Clínica Médica", topics:["Pneumocistose","Criptococose","Infecção pelo CMV","Sarcoma de Kaposi","Histoplasmose","Candidíase","Toxoplasmose no Adulto"] },
  { name:"Tuberculose", area:"Clínica Médica", topics:["Tuberculose - Patogênese e Epidemiologia","Tuberculose - Clínica e Diagnóstico","Tuberculose - Tratamento","Tuberculose Latente","Tuberculose Miliar e Extrapulmonar","Tuberculose na Criança","Tuberculose Pulmonar (Questões)"] },
  { name:"Sepse & Infecções Relacionadas à Saúde", area:"Clínica Médica", topics:["Segurança do Profissional da Saúde","Infecção por C. difficile","Pneumonia Associada ao Ventilador","Infecção de Corrente Sanguínea associada à Cateter","Sepse e Choque Séptico","Infecção do Trato Urinário"] },
  { name:"Infecções Respiratórias", area:"Clínica Médica", topics:["Pneumonia Adquirida na Comunidade","Pneumonia: Aspectos Patológicos e Radiológicos","Pneumonia por Micoplasma e Clamídia","Difteria","Radiografia de Tórax (Multimídia)","Abscesso Pulmonar","COVID-19"] },
  { name:"Infecções de Vias Aéreas Superiores", area:"Clínica Médica", topics:["Faringite Aguda","Influenza & Gripe","Mononucleose & Epstein Barr","Resfriado Comum","Rinossinusite Aguda","Síndrome Gripal & SRAG","Otite Média Aguda em Crianças","Rinossinusite em Crianças","Crupe"] },
  { name:"Infecções do SNC", area:"Clínica Médica", topics:["Meningites","Encefalites Infecciosas","Encefalite Herpética","Poliomielite","Encefalites Autoimunes"] },
  { name:"Infectologia Brasileira", area:"Clínica Médica", topics:["Leishmaniose","Doença de Chagas","Malária","Leptospirose","Febre Maculosa","Hanseníase","Hantavirose","Medicina Tropical (Multimídia)"] },
  { name:"Arboviroses", area:"Clínica Médica", topics:["Dengue","Chikungunya","Zika","Febre Amarela","Febre Oropouche","Febre do Mayaro"] },
  { name:"Parasitoses — Parte 1", area:"Clínica Médica", topics:["Giardíase","Toxocaríase","Estrongiloidíase","Esquistossomose","Ascaridíase"] },
  { name:"Parasitoses — Parte 2", area:"Clínica Médica", topics:["Amebíase","Cisticercose","Ancilostomíase","Tricuríase","Parasitoses (Questões)"] },
  { name:"Outras Infecções", area:"Clínica Médica", topics:["Febre Tifoide","Varíola","Mpox","Tétano","Raiva Humana","Herpes-Zóster","Herpes Simplex"] },
  { name:"Micologia", area:"Clínica Médica", topics:["Paracoccidioidomicose","Aspergilose Invasiva","Esporotricose","Mucormicose"] },
  { name:"Infecções de Pele e Partes Moles", area:"Clínica Médica", topics:["Celulite e Erisipela","Impetigo","Infecção Necrotizante de Tecidos Moles","Úlcera de Buruli","Doença Pilonidal","Gangrena Gasosa","Infecções de Pele e Partes Moles (Questões)"] },
  { name:"Antibióticos", area:"Clínica Médica", topics:["Carbapenêmicos e Monobactâmicos","Cefalosporinas","Lincosamidas","Macrolídeos","Penicilinas","Antibióticos (Questões)"] },
  { name:"Exposições Ambientais — Parte 1: Animais & Intoxicações", area:"Clínica Médica", topics:["Corpo Estranho na Pediatria","Mordedura de Animais","Acidentes Ofídicos","Acidentes com Aracnídeos","Acidente Escorpiônico","Intoxicação por Paracetamol","Intoxicação por Opioides"] },
  { name:"Exposições Ambientais — Parte 2: Síndromes Tóxicas", area:"Clínica Médica", topics:["Síndrome Serotoninérgica","Síndrome Adrenérgica","Síndrome Colinérgica & Intoxicação por Carbamatos/Organofosforados","Intoxicação por Benzodiazepínicos","Síndrome Anticolinérgica","Intoxicação por Lítio","Manejo de Intoxicações (Questões)"] },
  { name:"Dermatologia — Parte 1: Inflamatória", area:"Clínica Médica", topics:["Psoríase","Dermatite de Fralda","Dermatite de Contato","Eritema Nodoso","Pênfigo","Acne","Hidradenite Supurativa"] },
  { name:"Dermatologia — Parte 2: Outras", area:"Clínica Médica", topics:["Sarcomas","Lesões por Psoríase (Multimídia)","Alterações Ungueais (Multimídia)","Lesões Elementares (Multimídia)","Semiologia das Extremidades (Multimídia)","Neurofibromatose"] },
  { name:"Dermatoses Infecciosas — Parte 1: Parasitárias & Fúngicas", area:"Clínica Médica", topics:["Larva Migrans","Pediculose","Tungíase","Escabiose","Dermatoses Parasitárias (Questões)","Dermatofitoses (Tínea)","Pitiríase Versicolor","Dermatoses Fúngicas (Questões)"] },
  { name:"Dermatoses Infecciosas — Parte 2: Virais & Bacterianas", area:"Clínica Médica", topics:["Molusco Contagioso","Lesões por HPV","Orf Humano","Síndrome de Gianotti-Crosti","Dermatoses Virais (Questões)","Lesões por Vírus (Multimídia)","Lesões por Bactérias (Multimídia)","Lesões Orais (Multimídia)"] },
  { name:"Farmacodermias", area:"Clínica Médica", topics:["Síndrome de Stevens-Johnson e NET","Síndrome DRESS","Eritema Multiforme","Farmacodermias (Questões)"] },
  { name:"Câncer de Pele", area:"Clínica Médica", topics:["Carcinoma Basocelular","Carcinoma Espinocelular","Melanoma"] },
  { name:"Úlceras Genitais", area:"Clínica Médica", topics:["Herpes Genital","Linfogranuloma Venéreo","Cancroide","Donovanose","Úlcera de Lipschütz","Abordagem das Úlceras Genitais","Sífilis","Lesões por Infecções Sexualmente Transmissíveis (Multimídia)"] },
  { name:"Alergologia", area:"Clínica Médica", topics:["Hipersensibilidade","Sistema Imune","Rinite Alérgica","Urticária","Anafilaxia","Alergia Alimentar","Dermatite Atópica"] },
  { name:"Geriatria", area:"Clínica Médica", topics:["Manejo Paliativo de Sintomas","Cuidados Paliativos","Delirium","Idoso Frágil & Polifarmácia","Atendimento ao Idoso Vítima de Violência"] },
  { name:"Oftalmologia — Parte 1: Urgências & Glaucoma", area:"Clínica Médica", topics:["Abrasão Corneana e Corpo Estranho","Conjuntivites","Olho Vermelho (Questões)","Glaucoma","Trauma Ocular"] },
  { name:"Oftalmologia — Parte 2: Doenças Crônicas", area:"Clínica Médica", topics:["Catarata","Exame Físico Oftalmológico","Fundoscopia","Anatomia do Olho","Degeneração Macular","Distúrbios da Refração","Doenças da Pálpebra","Estrabismo"] },
  { name:"Otorrinolaringologia", area:"Clínica Médica", topics:["Otoscopia (Multimídia)","Condições da Orelha e Ouvido (Multimídia)","Condições da Boca (Multimídia)","Otite Externa","Otite Média","Epistaxe","Distúrbios da Audição"] },
  { name:"Outras Pneumopatias", area:"Clínica Médica", topics:["Tabagismo","Hipertensão Pulmonar","Avaliação das Doenças Pulmonares Intersticiais","Fibrose Pulmonar Idiopática","Bronquiectasia","Tosse Crônica"] },
  { name:"Vertigem", area:"Clínica Médica", topics:["Doença de Menière","Avaliação da Vertigem","Neurite Vestibular","Vertigem Posicional Paroxística Benigna"] },
  // CLÍNICA CIRÚRGICA
  { name:"Abdome Agudo — Parte 1: Inflamatório", area:"Clínica Cirúrgica", topics:["Apendicite","Doença Diverticular","Diverticulite","Pancreatite Aguda"] },
  { name:"Abdome Agudo — Parte 2: Obstrutivo, Perfurativo & Vascular", area:"Clínica Cirúrgica", topics:["Abdome Agudo Obstrutivo","Abdome Agudo Perfurativo","Abdome Agudo Vascular","Abdome Agudo - Radiografia (Multimídia)","Abdome Agudo - Tomografia (Multimídia)"] },
  { name:"Hérnias", area:"Clínica Cirúrgica", topics:["Hérnias Inguinocrurais","Outras Hérnias","Hérnias da Infância","Laparoscopia de Hérnias Inguinocrurais (Multimídia)"] },
  { name:"Vias Biliares — Parte 1: Colecistite & Colelitíase", area:"Clínica Cirúrgica", topics:["Colecistite","Colelitíase e Colecistolitíase","Coledocolitíase","Colecistectomia e Lesões da Via Biliar","Colangite Aguda","Íleo Biliar"] },
  { name:"Vias Biliares — Parte 2: Neoplasias & Especiais", area:"Clínica Cirúrgica", topics:["Síndrome de Mirizzi","Vesícula de Porcelana","Câncer da Vesícula Biliar","Colangiocarcinoma","Colangiografia & CPRE (Multimídia)","Ultrassonografia das Vias Biliares (Multimídia)","Neoplasias da Via Biliar (Questões)"] },
  { name:"Hemorragia Digestiva & Doenças Anorretais", area:"Clínica Cirúrgica", topics:["Hemorragia Digestiva Alta","Hemorragia Digestiva Baixa","Doença Hemorroidária","Abscesso e Fístula Anorretal","Fissura Anal","Câncer Anal","Coloproctologia (Multimídia)"] },
  { name:"Esôfago", area:"Clínica Cirúrgica", topics:["Esôfago de Barrett","Esofagites","Disfagia","Acalásia","Megaesôfago & Megacólon Chagásico","Esofagograma (Multimídia)","Divertículos Esofágicos","Câncer de Esôfago","Endoscopia Digestiva Alta (Multimídia)"] },
  { name:"Estômago", area:"Clínica Cirúrgica", topics:["Doença do Refluxo Gastroesofágico","Refluxo Gastroesofágico na Criança","H. pylori","Câncer de Estômago","Úlcera Péptica","Inibidores da Bomba de Prótons"] },
  { name:"Pâncreas & Cólon", area:"Clínica Cirúrgica", topics:["Câncer Colorretal","Câncer de Pâncreas Exócrino","Tumores Císticos do Pâncreas","Tumores Neuroendócrinos","Oncologia do Aparelho Digestivo – Exames de Imagem (Multimídia)"] },
  { name:"Lesões Hepáticas", area:"Clínica Cirúrgica", topics:["Abscesso Hepático","Tumores Hepáticos Benignos","Carcinoma Hepatocelular","Lesões Focais & Tumores Hepáticos (Multimídia)","Lesões Císticas do Fígado e Via Biliar"] },
  { name:"Doenças Vasculares — Parte 1: Venosas & Arteriais", area:"Clínica Cirúrgica", topics:["Trombose Venosa Profunda","Insuficiência Venosa Crônica","Oclusão Arterial Aguda","Doença Arterial Obstrutiva Periférica","Estenose de Carótidas"] },
  { name:"Doenças Vasculares — Parte 2: Aorta & Imagem", area:"Clínica Cirúrgica", topics:["Dissecção de Aorta e Outras Síndromes Aórticas","Aneurismas de Aorta Abdominal","Semiologia Vascular (Multimídia)","Ultrassonografia Vascular (Multimídia)"] },
  { name:"Cirurgia Torácica", area:"Clínica Cirúrgica", topics:["Pneumotórax","Traqueomalácia","Câncer de Pulmão","Ultrassonografia Pulmonar (Multimídia)","Tomografia de Tórax (Multimídia)","Derrame Pleural","Massas Mediastinais (Questões)"] },
  { name:"Cabeça e Pescoço", area:"Clínica Cirúrgica", topics:["Nódulos Tireoidianos","Câncer de Tireoide","Tireoidectomia","Nódulos Cervicais","Nódulos Cervicais (Questões)","Câncer de Cabeça e Pescoço"] },
  { name:"Neoplasias Urológicas", area:"Clínica Cirúrgica", topics:["Câncer de Próstata","Câncer de Bexiga","Câncer de Pênis","Câncer de Testículo","Tumores Renais","Cistos & Massas Renais (Multimídia)"] },
  { name:"Urologia", area:"Clínica Cirúrgica", topics:["Nefrolitíase","Hiperplasia Prostática Benigna","Priapismo","Doença de Peyronie","Afecções Testiculares","Urologia (Multimídia)"] },
  { name:"Ortopedia — Parte 1: Coluna & Membros Inferiores", area:"Clínica Cirúrgica", topics:["Lombalgia","Radiculopatias","Osteomielite em Adultos","Lesões Meniscais","Lesões do Ligamento Cruzado Anterior","Entorses de Tornozelo","Lesões do Tendão de Aquiles"] },
  { name:"Ortopedia — Parte 2: Membros Superiores & Tumores", area:"Clínica Cirúrgica", topics:["Síndrome do Impacto","Síndrome do Túnel do Carpo","Epicondilite","Tendinopatia de Quervain","Lesões de Manguito Rotador","Síndrome do Desfiladeiro Torácico","Tumores Ósseos Malignos","Tumores Ósseos Benignos","Osteogênese Imperfeita","Cisto de Baker"] },
  { name:"Fraturas — Parte 1: Gerais & MMII", area:"Clínica Cirúrgica", topics:["Profilaxia do Tétano","Conceitos Gerais de Fraturas","Fraturas Expostas","Fraturas de Quadril","Fraturas de Tíbia","Fraturas de Tornozelo"] },
  { name:"Fraturas — Parte 2: MMSS & Complicações", area:"Clínica Cirúrgica", topics:["Fraturas de Antebraço","Fraturas de Dedo & Mão & Punho","Fraturas de Úmero","Síndrome da Embolia Gordurosa","Síndrome Compartimental","Fraturas em Crianças (Multimídia)"] },
  { name:"Princípios de Cirurgia — Parte 1: Pré & Intraoperatório", area:"Clínica Cirúrgica", topics:["Avaliação Pré-Operatória","Protocolo de Cirurgia Segura","Nutrição Perioperatória","REMIT","Cicatrização de Feridas","Fios & Suturas","Cirurgia Minimamente Invasiva"] },
  { name:"Princípios de Cirurgia — Parte 2: Técnica & Pós-op", area:"Clínica Cirúrgica", topics:["Instrumentação Cirúrgica (Multimídia)","Acesso Venoso Central","Tórax e Abdome (Multimídia)","Partes Moles (Multimídia)","Ostomias"] },
  { name:"Complicações Cirúrgicas", area:"Clínica Cirúrgica", topics:["Infecção de Sítio Cirúrgico e Antibioticoprofilaxia","Deiscência de Anastomose Duodenal","Seroma & Hematoma & Deiscência","Síndrome Compartimental Abdominal","Febre e Atelectasia no Pós-Operatório","Fístulas do Trato Gastrointestinal"] },
  { name:"Anestesiologia", area:"Clínica Cirúrgica", topics:["Anestesia Geral","Anestesia Neuroaxial","Anestesia Local","Sequência Rápida de Intubação","Avaliação das Vias Aéreas (Multimídia)"] },
  { name:"Cirurgia Plástica", area:"Clínica Cirúrgica", topics:["Enxertos e Retalhos","Úlceras Por Pressão","Avaliação de Feridas & Cicatrizes (Multimídia)"] },
  { name:"Trauma - Avaliação Inicial", area:"Clínica Cirúrgica", topics:["Epidemiologia e Triagem no Trauma","Avaliação Inicial no Trauma","Imobilização Cervical e Via Aérea no Trauma","Via Aérea Básica e Avançada","Choque Hemorrágico","Tromboelastografia"] },
  { name:"Trauma - Abdominal & Pélvico", area:"Clínica Cirúrgica", topics:["Trauma Abdominal e Diafragmático","Trauma Gastrointestinal","Trauma Esplênico","Trauma Hepático","Trauma de Abdome e Pelve - Radiografia (Multimídia)","Cirurgia de Controle de Danos","e-FAST (Multimídia)","FAST – Noções de Ultrassonografia (Multimídia)","Trauma Abdominal – Tomografia (Multimídia)","Trauma Pélvico"] },
  { name:"Trauma - TCE", area:"Clínica Cirúrgica", topics:["Noções Gerais de TCE e Concussão","Fratura de Crânio e Hematomas Intracranianos","TCE Grave e Herniação Cerebral","Escala de Coma de Glasgow","Trauma Cranioencefálico (Multimídia)"] },
  { name:"Trauma Torácico & Cervical", area:"Clínica Cirúrgica", topics:["Trauma Torácico","Trauma Torácico - Radiografia (Multimídia)","Trauma de Face","Trauma Cervical","Trauma Vertebral e Raquimedular","Trauma de Extremidades"] },
  { name:"Trauma - Queimadura & Populações Especiais", area:"Clínica Cirúrgica", topics:["Queimaduras","Choque Elétrico","Afogamento","Trauma na Criança","Trauma na Gestante","Trauma no Idoso"] },
  { name:"Trauma - Retroperitoneal", area:"Clínica Cirúrgica", topics:["Trauma Retroperitoneal","Trauma do Duodeno e do Pâncreas","Trauma Renal","Trauma de Uretra & Bexiga & Ureter"] },
  // PEDIATRIA
  { name:"Infectologia Pediátrica — Parte 1: Respiratória", area:"Pediatria", topics:["Bronquiolite","Coqueluche","Pneumonia na Criança","Radiografia de Tórax Pediátrico (Multimídia)","Crupe"] },
  { name:"Infectologia Pediátrica — Parte 2: Sistêmica", area:"Pediatria", topics:["ITU na Criança","Meningites em Crianças","Caxumba","Síndrome da Pele Escaldada Estafilocócica","Febre Sem Sinais Localizatórios & de Origem Indeterminada"] },
  { name:"Doenças Exantemáticas", area:"Pediatria", topics:["Sarampo","Rubéola","Varicela","Parvovírus B19 & Eritema Infeccioso","Exantema Súbito","Mão-Pé-Boca & Herpangina","Escarlatina","Doenças Exantemáticas (Multimídia)","Doenças Exantemáticas (Questões)"] },
  { name:"Reumatologia Pediátrica", area:"Pediatria", topics:["Doença de Kawasaki","Síndrome Inflamatória Multissistêmica Pediátrica (SIM-P)","Síndrome PFAPA","Artrite Idiopática Juvenil","Lúpus Eritematoso Sistêmico Juvenil"] },
  { name:"Puericultura — Parte 1: Alimentação & Desenvolvimento", area:"Pediatria", topics:["Aleitamento Materno","Introdução Alimentar","Vitaminas & Minerais na Puericultura","Avaliação do DNPM","Avaliação Pôndero-Estatural","Desnutrição"] },
  { name:"Puericultura — Parte 2: Saúde & Proteção", area:"Pediatria", topics:["Saúde Bucal","Abuso Infantil","Enurese Noturna","Puericultura (Multimídia)","DNPM (Multimídia)","Maus Tratos (Multimídia)"] },
  { name:"Cuidados Pós-Natais — Parte 1: RN Normal", area:"Pediatria", topics:["Classificação do Recém-Nascido","Reanimação Neonatal","Cuidados de Sala de Parto & Alojamento Conjunto","Hiperbilirrubinemia Indireta Neonatal","Colestase Neonatal","Icterícia Neonatal (Questões)"] },
  { name:"Cuidados Pós-Natais — Parte 2: Distúrbios Metabólicos", area:"Pediatria", topics:["Hipoglicemia Neonatal","Hipocalcemia Neonatal","Distúrbios Metabólicos do RN (Questões)","Alterações Cutâneas do RN","Sepse Neonatal","Infecções por Clamídia no Recém-Nascido","Semiologia Pediátrica (Multimídia)"] },
  { name:"Desconforto Respiratório do RN", area:"Pediatria", topics:["Síndrome da Aspiração de Mecônio","Hipertensão Pulmonar Persistente do RN","Taquipneia Transitória do RN","Síndrome do Desconforto Respiratório do RN","Asfixia Perinatal","Pneumonia Neonatal","Desconforto respiratório do RN (Questões)"] },
  { name:"Prematuridade", area:"Pediatria", topics:["Complicações da Prematuridade","Displasia Broncopulmonar","Enterocolite Necrosante","Doença Hemorrágica do RN"] },
  { name:"Cirurgia Pediátrica - Gastrointestinal", area:"Pediatria", topics:["Divertículo de Meckel","Intussuscepção Intestinal","Neoplasias Pediátricas","Estenose Hipertrófica de Piloro","Gastrosquise e Onfalocele","Atresia Intestinal","Atresia de Esôfago e Fístulas Traqueoesofágicas","Malformações Anorretais","Doença Hirschsprung"] },
  { name:"Cirurgia Pediátrica - Torácica & Cardíaca", area:"Pediatria", topics:["Cardiopatias Congênitas Acianóticas","Cardiopatias Congênitas Cianóticas","Cardiopatias Congênitas (Questões)","Malformações Broncopulmonares","Hérnia Diafragmática Congênita"] },
  { name:"Cirurgia Pediátrica - Urológica", area:"Pediatria", topics:["Criptorquidia","Hipospádia","Fimose e Parafimose","Hipospádia e Fimose (Questões)","Malformações de Vias Urinárias"] },
  { name:"Ortopedia Pediátrica", area:"Pediatria", topics:["Mielomeningocele","Sinovite Transitória","Doença de Osgood-Schlatter","Displasia do Desenvolvimento do Quadril","Epifisiólise Proximal do Fêmur","Escoliose","Torcicolo Congênito","Dor do Crescimento"] },
  { name:"Neurologia Pediátrica", area:"Pediatria", topics:["BRUE","Transtorno do Espectro Autista (TEA)","Transtorno do Déficit de Atenção e Hiperatividade","Transtorno Opositor Desafiador","Paralisia Cerebral"] },
  { name:"Hebiatria", area:"Pediatria", topics:["Puberdade Fisiológica","Atendimento a Adolescentes","Segurança da Criança","Alterações da Puberdade"] },
  { name:"Infecções Congênitas", area:"Pediatria", topics:["Toxoplasmose Congênita","Infecção pelo Citomegalovírus Congênita","Infecção pelo Zika Vírus Congênita","Rubéola Congênita","Sífilis Congênita","Infecções Congênitas (Multimídia)"] },
  { name:"Triagem Neonatal & Genética — Parte 1", area:"Pediatria", topics:["Testes de Triagem Neonatal","Fibrose Cística","Hiperplasia Adrenal Congênita","Hipotireoidismo Congênito","Erros Inatos do Metabolismo"] },
  { name:"Triagem Neonatal & Genética — Parte 2", area:"Pediatria", topics:["Discinesia Ciliar Primária","Síndrome de Down","Síndrome Alcoólica Fetal","Síndromes Genéticas & Doenças Congênitas (Multimídia)","Rastreamento de Cromossomopatias (Questões)"] },
  // GINECOLOGIA E OBSTETRÍCIA
  { name:"Pré-Natal — Parte 1: Fundamentos", area:"Ginecologia e Obstetrícia", topics:["Diagnóstico & Datação da Gestação","Adaptações & Queixas da Gestação","Assistência Pré-Natal","Vacinas da Gestante","Direitos da Gestante"] },
  { name:"Pré-Natal — Parte 2: Intercorrências", area:"Ginecologia e Obstetrícia", topics:["Fármacos na Gestação","Êmese e Hiperêmese Gravídica","Aloimunização Rh","Semiologia Obstétrica (Multimídia)","Ultrassonografia na Obstetrícia (Multimídia)"] },
  { name:"Hipertensão & Diabetes na Gestação", area:"Ginecologia e Obstetrícia", topics:["Síndrome HELLP","Pré-Eclâmpsia","Eclâmpsia","Hipertensão Gestacional","Diabetes Mellitus Gestacional","Gestação Múltipla","Doenças Clínicas na Gestação","Doenças da Tireoide na Gestação","Insuficiência Istmo-Cervical"] },
  { name:"Sangramentos na Gestação", area:"Ginecologia e Obstetrícia", topics:["Doença Trofoblástica Gestacional","Abortamento","Gestação Ectópica","Violência Sexual e Aborto Induzido","Abuso Sexual (Multimídia)","Placenta Prévia","Descolamento Prematuro de Placenta","Rotura Uterina","Vasa Prévia"] },
  { name:"Infecções na Gestação", area:"Ginecologia e Obstetrícia", topics:["HIV na Gestação","Sífilis na Gestação","Outras Infecções na Gestação","ITU na Gestação","Toxoplasmose na Gestação"] },
  { name:"Parto — Parte 1: Trabalho de Parto", area:"Ginecologia e Obstetrícia", topics:["Profilaxia de Estrepto B","Fases do Trabalho de Parto","Estática Fetal","Indução do Parto","Partograma","Assistência ao Trabalho de Parto"] },
  { name:"Parto — Parte 2: Distócias & Procedimentos", area:"Ginecologia e Obstetrícia", topics:["Parto Pélvico","Cesárea","Distócias","Fórceps"] },
  { name:"Intercorrências no Parto", area:"Ginecologia e Obstetrícia", topics:["Rotura Prematura de Membranas Ovulares","Restrição de Crescimento Intrauterino","Dopplervelocitometria e Perfil Biofísico Fetal","Trabalho de Parto Prematuro","Corioamnionite","Pós-Datismo","Óbito Fetal","Imagens de Cardiotocografia (Multimídia)","Cardiotocografia"] },
  { name:"Puerpério", area:"Ginecologia e Obstetrícia", topics:["Modificações Fisiológicas do Puerpério","Infecções Puerperais","Hemorragia Pós-Parto"] },
  { name:"Oncoginecologia — Parte 1: Colo & Ovário", area:"Ginecologia e Obstetrícia", topics:["Câncer de Colo Invasivo","Rastreio do Câncer de Colo","Câncer de Ovário","Hiperplasia e Câncer de Endométrio"] },
  { name:"Oncoginecologia — Parte 2: Vulva & Anexos", area:"Ginecologia e Obstetrícia", topics:["Massas Anexiais Benignas","Massas Anexiais (Multimídia)","Dermatoses da Vulva","Neoplasias da Vulva"] },
  { name:"Mama", area:"Ginecologia e Obstetrícia", topics:["Câncer de Mama","Rastreio do Câncer de Mama","Lesões Benignas da Mama","Mastalgia","Secreção Papilar","Semiologia Mamária (Multimídia)","Mamografia (Multimídia)","Ultrassonografia Mamária (Multimídia)"] },
  { name:"Sangramento Uterino Anormal", area:"Ginecologia e Obstetrícia", topics:["Avaliação de SUA","Adenomiose","Dismenorreia","Leiomioma","Pólipo Uterino","Endometriose","Semiologia Ginecológica (Multimídia)","Ultrassonografia na Ginecologia (Multimídia)"] },
  { name:"Contracepção & Infertilidade — Parte 1", area:"Ginecologia e Obstetrícia", topics:["Conceitos Gerais de Contracepção","Métodos Definitivos","Métodos Intrauterinos","Métodos de Barreira","Métodos Naturais","Métodos Hormonais","Contracepção (Questões)"] },
  { name:"Contracepção & Infertilidade — Parte 2", area:"Ginecologia e Obstetrícia", topics:["Infertilidade - Avaliação","Infertilidade - Tratamento"] },
  { name:"Amenorreia Primária", area:"Ginecologia e Obstetrícia", topics:["Fisiologia Menstrual","Ginecologia Endócrina (Multimídia)","Deficiência Isolada de GnRH","Anomalias Uterovaginais","Avaliação da Amenorreia Primária","Síndrome de Turner","Síndrome Pré-Menstrual","Deficiências Androgênicas e Endocrinopatias"] },
  { name:"Amenorreia Secundária", area:"Ginecologia e Obstetrícia", topics:["Aderências Intrauterinas","Insuficiência Ovariana Primária","Avaliação da Amenorreia Secundária","Amenorreia Hipotalâmica Funcional","Síndrome dos Ovários Policísticos","Hiperprolactinemia"] },
  { name:"Menopausa & Uroginecologia", area:"Ginecologia e Obstetrícia", topics:["Síndrome Genitourinária da Menopausa","Climatério e Menopausa","Incontinência Urinária","Prolapso de Órgãos Pélvicos"] },
  { name:"Vulvovaginites", area:"Ginecologia e Obstetrícia", topics:["Vaginose Bacteriana","Tricomoníase","Vaginite Inflamatória Descamativa","Cisto & Abscesso da Glândula de Bartholin","Vaginose Citolítica","Candidíase Vaginal","Vulvovaginites em Crianças","Doença Inflamatória Pélvica","Cervicite & Uretrite & Epididimite & Proctite"] },
  // PREVENTIVA & SOCIAL
  { name:"SUS & Políticas Públicas — Parte 1: Organização", area:"Preventiva & Social", topics:["Marcos Históricos do SUS","Organização Jurídica do SUS","Organização Financeira do SUS","Princípios do SUS"] },
  { name:"SUS & Políticas Públicas — Parte 2: Políticas", area:"Preventiva & Social", topics:["Política Nacional de Humanização","Políticas e Protocolos","Políticas de Saúde Mental","SUS (Questões)"] },
  { name:"Atenção Primária", area:"Preventiva & Social", topics:["Prevenção e Promoção da Saúde","Atributos da APS","Projeto Terapêutico Singular","Política Nacional de Atenção Básica","Abordagem Familiar e Comunitária","Método Clínico Centrado na Pessoa"] },
  { name:"Epidemiologia", area:"Preventiva & Social", topics:["Vigilância Epidemiológica","Saúde Coletiva","Transição Demográfica e Epidemiológica","Endemia & Epidemia & Pandemia","Epidemiologia (Multimídia)","Epidemiologia Brasileira (Questões)"] },
  { name:"Medicina Baseada em Evidências", area:"Preventiva & Social", topics:["Estudos Epidemiológicos","Conceitos em Pesquisa Clínica","Testes Diagnósticos","Medidas de Associação","Bioestatística"] },
  { name:"Medicina Legal", area:"Preventiva & Social", topics:["Saúde do Trabalhador","Código de Ética Médica","Morte Encefálica","Declaração de Óbito","Declaração de Óbito (Multimídia)","Medicina Legal (Multimídia)"] },
  { name:"Vacinação — Parte 1: Calendário & Básicas", area:"Preventiva & Social", topics:["Noções Sobre Vacinação","Calendário Vacinal - Criança & Adulto & Idoso","Vacinas das Arboviroses","BCG","Pentavalente e DTP","Vacinas da Poliomielite"] },
  { name:"Vacinação — Parte 2: Específicas", area:"Preventiva & Social", topics:["Vacina do Rotavírus","Vacinas das Hepatites","Vacinas do Pneumococo & Meningococo","Vacinas do HPV","Influenza & COVID-19 & VSR","Tríplice Viral & Varicela & Herpes-Zóster"] },
];
// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function daysBetween(d1,d2){ return Math.round((new Date(d2)-new Date(d1))/(1000*60*60*24)); }
function daysFromNow(d){ return daysBetween(new Date(),d); }
function addDays(d,n){ const r=new Date(d); r.setDate(r.getDate()+n); return r; }
function fmt(d){ return d?new Date(d).toLocaleDateString("pt-BR"):"—"; }
function isVesp(){ return daysFromNow(EXAM_DATE)<=VESP_DAYS; }

function prevScore(mod){
  let s=0,c=0;
  mod.topics.forEach(t=>{ const i=PREV_ORDER.indexOf(t); if(i>=0){s+=(PREV_ORDER.length-i);c++;} });
  return c>0?s/c:0;
}
function prevLabel(score,max){
  const r=score/max;
  if(r>0.6) return {label:"Alta",color:"#dc2626",bg:"#fef2f2",emoji:"🔴"};
  if(r>0.3) return {label:"Média",color:"#d97706",bg:"#fffbeb",emoji:"🟡"};
  return {label:"Baixa",color:"#16a34a",bg:"#f0fdf4",emoji:"🟢"};
}
function daysSinceLast(m){
  if(!m.history||!m.history.length) return null;
  return daysBetween(m.history[m.history.length-1].date, new Date());
}
function maxGap(score,max){
  return Math.round(30-(score/max)*20);
}
function isNeglected(m,max){
  if(m.status==="não estudado") return false;
  const r=m.prevalenceScore/max; if(r<0.3) return false;
  const d=daysSinceLast(m); if(d===null) return false;
  return d>maxGap(m.prevalenceScore,max);
}
function suggestedQ(m,max){
  const r=m.prevalenceScore/max;
  let base=Math.round(25+r*55); // 25-80 range
  if(m.avgAccuracy>0){
    if(m.avgAccuracy<50) base=Math.round(base*1.5);
    else if(m.avgAccuracy<65) base=Math.round(base*1.25);
    else if(m.avgAccuracy>=85) base=Math.round(base*0.8);
  }
  const dLeft=daysFromNow(EXAM_DATE);
  if(dLeft<60) base=Math.round(base*1.3);
  else if(dLeft<120) base=Math.round(base*1.1);
  return Math.max(15,base); // no upper cap for important topics
}
function revReasons(m,max){
  const today=new Date(); today.setHours(0,0,0,0);
  const overdue=m.nextReview&&new Date(m.nextReview)<today;
  const r=[];
  if(overdue) r.push("⚠️ Revisão atrasada");
  if(m.avgAccuracy>0&&m.avgAccuracy<60) r.push("📉 Desempenho baixo");
  if(m.prevalenceScore/max>0.6) r.push("🔥 Alta incidência");
  const ds=daysSinceLast(m);
  if(ds!==null&&ds>14&&m.prevalenceScore/max>0.4) r.push(`⏰ ${ds} dias sem contato`);
  if(!r.length) r.push("📅 Revisão programada");
  return r;
}
function calcNextRev(date,acc,score,max){
  const r=score/max;
  let base;
  if(acc>=85) base=14; else if(acc>=70) base=7; else if(acc>=50) base=4; else base=2;
  const interval=Math.max(2,Math.round(base*(1-r*0.45)));
  const dLeft=daysFromNow(EXAM_DATE);
  const urg=dLeft<60?0.65:dLeft<120?0.82:1;
  return addDays(date,Math.round(interval*urg));
}
function calcGenRevs(firstDate,score,max){
  const r=score/max;
  const dLeft=daysBetween(firstDate,EXAM_DATE);
  let n=r>0.7?3:r>0.3?2:dLeft>90?2:1;
  return Array.from({length:n},(_,i)=>({
    id:`gr-${Date.now()}-${i}`,
    date:addDays(firstDate,Math.round(dLeft*(i+1)/(n+1))),
    status:"pendente"
  }));
}

// ─────────────────────────────────────────────
// BUILD MODULES
// ─────────────────────────────────────────────
const MODULES_BASE = RAW_MODULES.map((m,i)=>({
  id:`mod-${i}`,name:m.name,area:m.area,topics:m.topics,
  status:"não estudado",history:[],generalReviews:[],
  nextReview:null,totalQuestions:0,avgAccuracy:0,
  prevalenceScore:prevScore(m),starred:false
}));
const MAX_PREV = Math.max(...MODULES_BASE.map(m=>m.prevalenceScore),1);

// Sort within each area by prevalence
const MODULES_INITIAL = GRANDES_AREAS.flatMap(area=>
  MODULES_BASE.filter(m=>m.area===area).sort((a,b)=>b.prevalenceScore-a.prevalenceScore)
);

// ─────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────
function load(){ try{ const s=localStorage.getItem("resid_v3"); return s?JSON.parse(s):null; }catch(e){return null;} }
function save(state){ try{ localStorage.setItem("resid_v3",JSON.stringify(state)); }catch(e){} }

// ─────────────────────────────────────────────
// STREAK & HEATMAP
// ─────────────────────────────────────────────
function calcStreak(log){
  if(!log||!log.length) return 0;
  const sorted=[...new Set(log)].sort().reverse();
  const today=new Date().toISOString().slice(0,10);
  const yest=new Date(Date.now()-86400000).toISOString().slice(0,10);
  if(sorted[0]!==today&&sorted[0]!==yest) return 0;
  let streak=0;
  for(let i=0;i<sorted.length;i++){
    const exp=new Date(sorted[0]);
    exp.setDate(exp.getDate()-i);
    if(sorted[i]===exp.toISOString().slice(0,10)) streak++;
    else break;
  }
  return streak;
}
function HeatMap({log}){
  const set=new Set(log||[]);
  const weeks=18;
  const cols=[];
  const now=new Date(); now.setHours(0,0,0,0);
  for(let c=0;c<weeks;c++){
    const col=[];
    for(let r=0;r<7;r++){
      const offset=(weeks-1-c)*7+(6-r);
      const d=new Date(now); d.setDate(d.getDate()-offset);
      col.push(d.toISOString().slice(0,10));
    }
    cols.push(col);
  }
  const today=new Date().toISOString().slice(0,10);
  return(
    <div style={{display:"flex",gap:2,flexWrap:"nowrap",overflowX:"auto"}}>
      {cols.map((col,ci)=>(
        <div key={ci} style={{display:"flex",flexDirection:"column",gap:2}}>
          {col.map(day=>(
            <div key={day} title={day} style={{
              width:11,height:11,borderRadius:2,flexShrink:0,
              background:set.has(day)?"#6366f1":"#e8e8f0",
              border:day===today?"1.5px solid #6366f1":"none",
              opacity:set.has(day)?1:0.5
            }}/>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// NOTEBOOK TOOLBAR & EDITOR
// ─────────────────────────────────────────────
const HIGHLIGHT_COLORS=["#fef08a","#bbf7d0","#bfdbfe","#fecaca","#e9d5ff"];

function RichToolbar({onCmd}){
  const [showHL,setShowHL]=useState(false);
  const tools=[
    {icon:"B",title:"Negrito",cmd:"bold",style:{fontWeight:800}},
    {icon:"I",title:"Itálico",cmd:"italic",style:{fontStyle:"italic"}},
    {icon:"U",title:"Sublinhado",cmd:"underline",style:{textDecoration:"underline"}},
    {icon:"H1",title:"Título",cmd:"h1",style:{fontSize:11}},
    {icon:"H2",title:"Subtítulo",cmd:"h2",style:{fontSize:11}},
    {icon:"• Lista",title:"Lista",cmd:"ul",style:{fontSize:11}},
    {icon:"1. Lista",title:"Lista numerada",cmd:"ol",style:{fontSize:11}},
    {icon:"—",title:"Divisória",cmd:"hr",style:{}},
    {icon:"🔖",title:"Marcar revisão",cmd:"mark",style:{fontSize:13}},
    {icon:"🖼",title:"Imagem",cmd:"image",style:{fontSize:13}},
  ];
  return(
    <div style={{display:"flex",gap:3,flexWrap:"wrap",padding:"8px 12px",background:"#f8f8fb",borderBottom:"1.5px solid #ebebf3",borderRadius:"12px 12px 0 0",alignItems:"center"}}>
      {tools.map(t=>(
        <button key={t.cmd} title={t.title} onMouseDown={e=>{e.preventDefault();onCmd(t.cmd);}}
          style={{...t.style,background:"#fff",border:"1.5px solid #e5e5eb",borderRadius:6,padding:"3px 9px",cursor:"pointer",fontFamily:"inherit",color:"#333",fontSize:12,transition:"border-color .1s"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#6366f1"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="#e5e5eb"}>
          {t.icon}
        </button>
      ))}
      {/* Highlight picker */}
      <div style={{position:"relative"}}>
        <button title="Marca-texto" onMouseDown={e=>{e.preventDefault();setShowHL(v=>!v);}}
          style={{background:"#fef08a",border:"1.5px solid #e5e5eb",borderRadius:6,padding:"3px 9px",cursor:"pointer",fontSize:12,fontWeight:700,transition:"border-color .1s"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#6366f1"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="#e5e5eb"}>
          🖊 Grifar
        </button>
        {showHL&&(
          <div style={{position:"absolute",top:34,left:0,background:"#fff",borderRadius:10,boxShadow:"0 4px 20px rgba(0,0,0,.15)",padding:8,display:"flex",gap:6,zIndex:50}}>
            {HIGHLIGHT_COLORS.map(c=>(
              <button key={c} title={c} onMouseDown={e=>{e.preventDefault();onCmd("highlight:"+c);setShowHL(false);}}
                style={{width:24,height:24,borderRadius:6,background:c,border:"1.5px solid #e5e5eb",cursor:"pointer"}}/>
            ))}
            <button onMouseDown={e=>{e.preventDefault();onCmd("highlight:remove");setShowHL(false);}}
              style={{width:24,height:24,borderRadius:6,background:"#f5f5f5",border:"1.5px solid #e5e5eb",cursor:"pointer",fontSize:10,fontWeight:700,color:"#888"}}>✕</button>
          </div>
        )}
      </div>
    </div>
  );
}

function NotebookEditor({area,content,onChange}){
  const ref=useRef(null);
  const fileRef=useRef(null);
  useEffect(()=>{ if(ref.current&&ref.current.innerHTML!==content) ref.current.innerHTML=content||"<p><br></p>"; },[area]);
  function emit(){ if(ref.current) onChange(ref.current.innerHTML); }
  function handleCmd(cmd){
    if(!ref.current) return; ref.current.focus();
    if(cmd==="bold") document.execCommand("bold");
    else if(cmd==="italic") document.execCommand("italic");
    else if(cmd==="underline") document.execCommand("underline");
    else if(cmd==="h1") document.execCommand("formatBlock",false,"h2");
    else if(cmd==="h2") document.execCommand("formatBlock",false,"h3");
    else if(cmd==="ul") document.execCommand("insertUnorderedList");
    else if(cmd==="ol") document.execCommand("insertOrderedList");
    else if(cmd==="hr") document.execCommand("insertHTML",false,"<hr style='border:none;border-top:2px solid #e0e0f0;margin:16px 0'/>");
    else if(cmd==="mark"){
      const sel=window.getSelection();
      const txt=sel&&sel.toString();
      document.execCommand("insertHTML",false,`<mark style="background:#fef3c7;padding:2px 4px;border-radius:3px;border-left:3px solid #f59e0b">🔖 ${txt||""}</mark>`);
    }
    else if(cmd.startsWith("highlight:")){
      const color=cmd.split(":")[1];
      const sel=window.getSelection();
      if(!sel||!sel.toString()) return;
      if(color==="remove") document.execCommand("removeFormat");
      else document.execCommand("insertHTML",false,`<mark style="background:${color};padding:1px 3px;border-radius:2px">${sel.toString()}</mark>`);
    }
    else if(cmd==="image") fileRef.current?.click();
    setTimeout(emit,50);
  }
  function handleImage(e){
    const f=e.target.files?.[0]; if(!f) return;
    const r=new FileReader();
    r.onload=ev=>{ ref.current?.focus(); document.execCommand("insertHTML",false,`<div style="margin:10px 0"><img src="${ev.target.result}" style="max-width:100%;border-radius:8px;border:1.5px solid #e5e5eb"/></div>`); setTimeout(emit,50); };
    r.readAsDataURL(f); e.target.value="";
  }
  function handlePaste(e){
    const items=e.clipboardData?.items;
    if(!items) return;
    for(const item of items){
      if(item.type.startsWith("image/")){
        e.preventDefault();
        const f=item.getAsFile();
        const r=new FileReader();
        r.onload=ev=>{ document.execCommand("insertHTML",false,`<div style="margin:10px 0"><img src="${ev.target.result}" style="max-width:100%;border-radius:8px;border:1.5px solid #e5e5eb"/></div>`); setTimeout(emit,50); };
        r.readAsDataURL(f);
      }
    }
  }
  return(
    <div style={{border:"1.5px solid #ebebf3",borderRadius:12,overflow:"hidden",display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
      <RichToolbar onCmd={handleCmd}/>
      <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImage}/>
      <div ref={ref} contentEditable suppressContentEditableWarning
        onInput={emit} onPaste={handlePaste}
        style={{flex:1,overflowY:"auto",padding:"18px 22px",outline:"none",fontSize:14,lineHeight:1.85,color:"#1a1a2e",fontFamily:"'DM Sans',system-ui,sans-serif"}}/>
      <style>{`
        [contenteditable] h2{font-size:20px;font-weight:700;margin:16px 0 8px;color:#1a1a2e}
        [contenteditable] h3{font-size:16px;font-weight:600;margin:14px 0 6px;color:#374151}
        [contenteditable] ul,[contenteditable] ol{padding-left:22px;margin:8px 0}
        [contenteditable] li{margin:4px 0}
        [contenteditable] p{margin:6px 0}
        [contenteditable] img{max-width:100%}
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// MINI SPARKLINE
// ─────────────────────────────────────────────
function Sparkline({history}){
  if(!history||history.length<2) return null;
  const vals=history.map(h=>h.accuracy);
  const min=Math.min(...vals); const max=Math.max(...vals); const range=max-min||1;
  const w=180; const h=44; const pad=4;
  const pts=vals.map((v,i)=>{
    const x=pad+(i/(vals.length-1))*(w-pad*2);
    const y=h-pad-((v-min)/range)*(h-pad*2);
    return `${x},${y}`;
  });
  const trend=vals[vals.length-1]-vals[0];
  return(
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <svg width={w} height={h} style={{overflow:"visible"}}>
        <polyline points={pts.join(" ")} fill="none" stroke={trend>=0?"#10b981":"#ef4444"} strokeWidth={2} strokeLinejoin="round"/>
        {vals.map((v,i)=>{
          const[x,y]=pts[i].split(",");
          return <circle key={i} cx={x} cy={y} r={3} fill={trend>=0?"#10b981":"#ef4444"}/>;
        })}
      </svg>
      <div style={{fontSize:12,fontWeight:700,color:trend>=0?"#10b981":"#ef4444"}}>
        {trend>=0?"↑":""}{trend>0?"+":""}{trend.toFixed(0)}pp
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TIMELINE component
// ─────────────────────────────────────────────
function Timeline({history,onDelete}){
  if(!history||!history.length) return(
    <div style={{color:"#aaa",fontSize:13,padding:"16px 0",textAlign:"center"}}>
      Nenhum estudo registrado ainda. Clique em "Registrar estudo" para começar!
    </div>
  );
  return(
    <div style={{position:"relative",paddingLeft:24}}>
      <div style={{position:"absolute",left:8,top:0,bottom:0,width:2,background:"#e8e8f0",borderRadius:1}}/>
      {history.map((h,i)=>{
        const isFirst=i===0;
        const acc=h.accuracy;
        const accColor=acc>=70?"#10b981":acc>=50?"#f59e0b":"#dc2626";
        const daysAgo=daysBetween(h.date,new Date());
        const daysToNext=i<history.length-1?daysBetween(h.date,history[i+1].date):null;
        return(
          <div key={i} style={{position:"relative",marginBottom:20}}>
            <div style={{position:"absolute",left:-20,top:4,width:12,height:12,borderRadius:"50%",background:isFirst?"#6366f1":"#fff",border:`2px solid ${isFirst?"#6366f1":"#9ca3af"}`,zIndex:1}}/>
            <div style={{background:"#f9f9fb",borderRadius:10,padding:"12px 14px",border:"1px solid #ebebf3"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#1a1a2e"}}>{isFirst?"📅 Primeiro contato":`🔁 Revisão ${i}`}</div>
                  <div style={{fontSize:12,color:"#888",marginTop:2}}>{fmt(h.date)} · {daysAgo===0?"hoje":`há ${daysAgo} dias`}</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:18,fontWeight:800,color:accColor}}>{acc}%</div>
                    <div style={{fontSize:11,color:"#888"}}>{h.questions} questões</div>
                  </div>
                  <button onClick={()=>onDelete(i)} title="Excluir este registro"
                    style={{background:"#fef2f2",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",color:"#dc2626",fontSize:12,fontWeight:600}}>
                    ✕
                  </button>
                </div>
              </div>
              {daysToNext!==null&&(
                <div style={{marginTop:8,fontSize:11,color:"#aaa",display:"flex",alignItems:"center",gap:4}}>
                  <div style={{flex:1,height:1,background:"#e8e8f0"}}/>
                  <span>{daysToNext}d até próxima revisão</span>
                  <div style={{flex:1,height:1,background:"#e8e8f0"}}/>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {history.length>0&&(
        <div style={{position:"relative",marginBottom:4}}>
          <div style={{position:"absolute",left:-20,top:4,width:12,height:12,borderRadius:"50%",background:"#e8e8f0",border:"2px dashed #9ca3af",zIndex:1}}/>
          <div style={{fontSize:12,color:"#6366f1",fontWeight:600,paddingLeft:4}}>
            🔜 Próxima revisão sugerida: — registre um estudo para calcular
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
export default function App(){
  const [modules,setModules]=useState(()=>{
    const s=load(); if(!s?.modules) return MODULES_INITIAL;
    // Merge saved data into current module list (preserves new modules)
    return MODULES_INITIAL.map(m=>{
      const saved=s.modules.find(sm=>sm.id===m.id||sm.name===m.name);
      return saved?{...m,...saved,id:m.id}:m;
    });
  });
  const [exams,setExams]=useState(()=>load()?.exams||[]);
  const [studyLog,setStudyLog]=useState(()=>{ try{return JSON.parse(localStorage.getItem("slog")||"[]");}catch(e){return[];} });
  const [notebooks,setNotebooks]=useState(()=>{ try{return JSON.parse(localStorage.getItem("nbs")||"{}");} catch(e){return {};} });
  const [todayDone,setTodayDone]=useState(()=>{ try{return parseInt(localStorage.getItem("tdone")||"0");}catch(e){return 0;} });
  const [page,setPage]=useState("home");
  const [selMod,setSelMod]=useState(null);
  const [showStudy,setShowStudy]=useState(false);
  const [studyForm,setStudyForm]=useState({date:new Date().toISOString().slice(0,10),questions:"",accuracy:""});
  const saveTimer=useRef(null);

  useEffect(()=>{ clearTimeout(saveTimer.current); saveTimer.current=setTimeout(()=>save({modules,exams}),600); },[modules,exams]);
  useEffect(()=>{ try{localStorage.setItem("slog",JSON.stringify(studyLog));}catch(e){} },[studyLog]);
  useEffect(()=>{ try{localStorage.setItem("nbs",JSON.stringify(notebooks));}catch(e){} },[notebooks]);
  useEffect(()=>{ try{localStorage.setItem("tdone",String(todayDone));}catch(e){} },[todayDone]);

  const stats=useMemo(()=>{
    const studied=modules.filter(m=>m.status!=="não estudado");
    const totalQ=modules.reduce((s,m)=>s+m.totalQuestions,0);
    const totalRev=modules.reduce((s,m)=>s+m.history.length,0);
    const concluded=modules.filter(m=>m.status==="concluído").length;
    const today=new Date(); today.setHours(0,0,0,0);
    const tomorrow=addDays(today,1);
    const todayRevs=modules.filter(m=>m.nextReview&&new Date(m.nextReview)>=today&&new Date(m.nextReview)<tomorrow);
    const overdueRevs=modules.filter(m=>m.nextReview&&new Date(m.nextReview)<today&&m.status!=="não estudado");
    const grPending=modules.flatMap(m=>(m.generalReviews||[]).filter(r=>{const d=new Date(r.date);d.setHours(0,0,0,0);return r.status==="pendente"&&d<=today;})).length;
    const accs=studied.filter(m=>m.avgAccuracy>0).map(m=>m.avgAccuracy);
    const globalAcc=accs.length?Math.round(accs.reduce((a,b)=>a+b,0)/accs.length):0;
    const neglected=modules.filter(m=>isNeglected(m,MAX_PREV));
    const vesp=isVesp();
    const seen=new Set(); const planMods=[];
    if(vesp){
      modules.filter(m=>m.status!=="não estudado")
        .sort((a,b)=>(b.prevalenceScore*(1-(b.avgAccuracy||50)/100))-(a.prevalenceScore*(1-(a.avgAccuracy||50)/100)))
        .forEach(m=>{if(!seen.has(m.id)){seen.add(m.id);planMods.push(m);}});
    } else {
      [...overdueRevs,...todayRevs,...neglected].forEach(m=>{if(!seen.has(m.id)){seen.add(m.id);planMods.push(m);}});
      planMods.sort((a,b)=>b.prevalenceScore-a.prevalenceScore);
    }
    const plan=planMods.map(m=>({...m,suggestedQ:suggestedQ(m,MAX_PREV),reasons:vesp?["🔴 Modo Véspera",...revReasons(m,MAX_PREV)]:revReasons(m,MAX_PREV)}));
    return{totalQ,totalRev,concluded,todayRevs,overdueRevs,grPending,globalAcc,studied:studied.length,neglected,plan,vesp};
  },[modules]);

  function registerStudy(){
    if(!selMod||!studyForm.questions||!studyForm.accuracy) return;
    const date=new Date(studyForm.date);
    const q=parseInt(studyForm.questions); const acc=parseFloat(studyForm.accuracy);
    const entry={date:date.toISOString(),questions:q,accuracy:acc};
    const newHist=[...(selMod.history||[]),entry];
    const totalQ=newHist.reduce((s,h)=>s+h.questions,0);
    const avgAcc=Math.round(newHist.reduce((s,h)=>s+h.accuracy,0)/newHist.length);
    const nextRev=calcNextRev(date,acc,selMod.prevalenceScore,MAX_PREV);
    let genRevs=selMod.generalReviews||[];
    if(newHist.length===1) genRevs=calcGenRevs(date,selMod.prevalenceScore,MAX_PREV);
    // Status: need at least 3 reviews + 70% avg to be "concluído"
    const status=avgAcc>=70&&newHist.length>=3?"concluído":"em andamento";
    const logDate=studyForm.date;
    setStudyLog(prev=>prev.includes(logDate)?prev:[...prev,logDate]);
    setModules(prev=>prev.map(m=>m.id===selMod.id?{...m,history:newHist,totalQuestions:totalQ,avgAccuracy:avgAcc,nextReview:nextRev.toISOString(),status,generalReviews:genRevs}:m));
    setSelMod(prev=>({...prev,history:newHist,totalQuestions:totalQ,avgAccuracy:avgAcc,nextReview:nextRev.toISOString(),status,generalReviews:genRevs}));
    setShowStudy(false);
    setStudyForm({date:new Date().toISOString().slice(0,10),questions:"",accuracy:""});
  }

  function deleteEntry(modId,idx){
    setModules(prev=>prev.map(m=>{
      if(m.id!==modId) return m;
      const newHist=m.history.filter((_,i)=>i!==idx);
      const totalQ=newHist.reduce((s,h)=>s+h.questions,0);
      const avgAcc=newHist.length?Math.round(newHist.reduce((s,h)=>s+h.accuracy,0)/newHist.length):0;
      const status=newHist.length===0?"não estudado":avgAcc>=70&&newHist.length>=3?"concluído":"em andamento";
      const nextRev=newHist.length?calcNextRev(new Date(newHist[newHist.length-1].date),newHist[newHist.length-1].accuracy,m.prevalenceScore,MAX_PREV).toISOString():null;
      return{...m,history:newHist,totalQuestions:totalQ,avgAccuracy:avgAcc,status,nextReview:nextRev};
    }));
    setSelMod(prev=>{
      if(!prev||prev.id!==modId) return prev;
      const newHist=prev.history.filter((_,i)=>i!==idx);
      return{...prev,history:newHist};
    });
  }

  function toggleGR(modId,grId){
    setModules(prev=>prev.map(m=>m.id!==modId?m:{...m,generalReviews:(m.generalReviews||[]).map(r=>r.id===grId?{...r,status:r.status==="feita"?"pendente":"feita"}:r)}));
  }
  function toggleStar(modId){
    setModules(prev=>prev.map(m=>m.id===modId?{...m,starred:!m.starred}:m));
  }

  const NAV=[
    {id:"home",icon:"🏠",label:"Início"},
    {id:"modules",icon:"📚",label:"Módulos"},
    {id:"schedule",icon:"📅",label:"Revisões"},
    {id:"performance",icon:"📊",label:"Desempenho"},
    {id:"errors",icon:"📝",label:"Caderno de Erros"},
    {id:"exams",icon:"🏆",label:"Provas na Íntegra"},
  ];
  const dLeft=Math.max(0,daysFromNow(EXAM_DATE));

  return(
    <div style={{fontFamily:"'DM Sans','Nunito',system-ui,sans-serif",minHeight:"100vh",background:"#f7f7f9",color:"#1a1a2e",display:"flex"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:#d0d0e0;border-radius:3px}
        .card{background:#fff;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.05),0 4px 12px rgba(0,0,0,.04)}
        .btn{cursor:pointer;border:none;border-radius:10px;font-family:inherit;font-weight:600;transition:all .15s;font-size:14px}
        .btn-primary{background:#6366f1;color:#fff;padding:10px 20px}
        .btn-primary:hover{background:#4f46e5;transform:translateY(-1px)}
        .btn-sm{padding:6px 14px;font-size:13px;border-radius:8px}
        .btn-ghost{background:transparent;color:#6366f1;border:1.5px solid #6366f1;padding:8px 16px}
        .btn-ghost:hover{background:#eef2ff}
        .input{width:100%;padding:10px 14px;border:1.5px solid #e5e5eb;border-radius:10px;font-family:inherit;font-size:14px;outline:none;transition:border .15s;background:#fff}
        .input:focus{border-color:#6366f1}
        textarea.input{resize:vertical;min-height:90px}
        .nav-item{cursor:pointer;padding:10px 14px;border-radius:10px;font-weight:500;font-size:14px;transition:all .15s;color:#666;display:flex;align-items:center;gap:9px;white-space:nowrap}
        .nav-item:hover{background:#f0f0f8;color:#6366f1}
        .nav-item.active{background:#eef2ff;color:#6366f1;font-weight:700}
        .pbar{height:6px;background:#e8e8f0;border-radius:3px;overflow:hidden}
        .pfill{height:100%;border-radius:3px;transition:width .4s}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px}
        .modal{background:#fff;border-radius:18px;padding:26px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto}
        .mod-card{background:#fff;border-radius:12px;padding:16px;border:1.5px solid #ebebf3;transition:all .15s;cursor:pointer}
        .mod-card:hover{border-color:#6366f1;box-shadow:0 4px 16px rgba(99,102,241,.12);transform:translateY(-1px)}
        .tag{display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700}
      `}</style>

      {/* SIDEBAR */}
      <div style={{width:210,background:"#fff",borderRight:"1.5px solid #ebebf3",padding:"20px 12px",display:"flex",flexDirection:"column",gap:3,position:"sticky",top:0,height:"100vh",overflowY:"auto",flexShrink:0}}>
        <div style={{padding:"0 6px 18px",borderBottom:"1px solid #f0f0f8",marginBottom:6}}>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:"#1a1a2e",lineHeight:1.2}}>Residência</div>
          <div style={{fontSize:11,color:"#aaa",marginTop:2}}>Sistema de Estudos</div>
        </div>
        {NAV.map(n=>(
          <div key={n.id} className={`nav-item${page===n.id||page==="moduleDetail"&&n.id==="modules"?" active":""}`} onClick={()=>setPage(n.id)}>
            <span style={{fontSize:15}}>{n.icon}</span>{n.label}
          </div>
        ))}
        <div style={{marginTop:"auto",padding:"14px 6px 0",borderTop:"1px solid #f0f0f8"}}>
          <div style={{fontSize:11,color:"#aaa",marginBottom:4}}>Prova em</div>
          <div style={{fontSize:22,fontWeight:800,color:dLeft<=30?"#dc2626":"#6366f1"}}>{dLeft} dias</div>
          <div style={{fontSize:11,color:"#aaa"}}>15 Nov 2026</div>
          <div style={{marginTop:10}}>
            <div className="pbar"><div className="pfill" style={{width:`${Math.min(100,(stats.totalQ/TARGET_Q)*100)}%`,background:"#6366f1"}}/></div>
            <div style={{fontSize:11,color:"#888",marginTop:3}}>{stats.totalQ.toLocaleString()} / {TARGET_Q.toLocaleString()}</div>
          </div>
          {stats.vesp&&<div style={{marginTop:10,fontSize:11,fontWeight:700,color:"#dc2626",background:"#fef2f2",padding:"6px 8px",borderRadius:8,textAlign:"center"}}>🔴 MODO VÉSPERA</div>}
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,overflowY:"auto",padding:"26px 28px",minWidth:0}}>
        {page==="home"&&<HomePage stats={stats} modules={modules} todayDone={todayDone} setTodayDone={setTodayDone} studyLog={studyLog} setPage={setPage} setSelMod={m=>{setSelMod(m);setShowStudy(true);}} toggleGR={toggleGR}/>}
        {page==="modules"&&<ModulesPage modules={modules} onOpen={m=>{setSelMod(m);setPage("moduleDetail");}} toggleStar={toggleStar}/>}
        {page==="moduleDetail"&&selMod&&<ModuleDetail mod={modules.find(m=>m.id===selMod.id)||selMod} onBack={()=>setPage("modules")} onStudy={()=>setShowStudy(true)} toggleGR={toggleGR} onDelete={deleteEntry}/>}
        {page==="schedule"&&<SchedulePage modules={modules} setSelMod={m=>{setSelMod(m);setShowStudy(true);}} toggleGR={toggleGR}/>}
        {page==="performance"&&<PerformancePage modules={modules} stats={stats}/>}
        {page==="errors"&&<ErrorsPage notebooks={notebooks} setNotebooks={setNotebooks}/>}
        {page==="exams"&&<ExamsPage exams={exams} setExams={setExams}/>}
      </div>

      {/* STUDY MODAL */}
      {showStudy&&selMod&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowStudy(false)}>
          <div className="modal">
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,color:AREA_COLOR[selMod.area],fontWeight:700,marginBottom:4}}>{selMod.area}</div>
              <h2 style={{fontSize:17,fontWeight:700}}>{selMod.name}</h2>
              <div style={{fontSize:12,color:"#888",marginTop:3}}>Revisão {(selMod.history?.length||0)+1} · {selMod.history?.length===0?"Primeiro contato":""}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              {[{label:"Data",type:"date",key:"date"},{label:"Questões feitas",type:"number",key:"questions",ph:"Ex: 40"},{label:"% de acertos",type:"number",key:"accuracy",ph:"Ex: 72",min:0,max:100}].map(f=>(
                <div key={f.key}>
                  <label style={{fontSize:13,fontWeight:600,display:"block",marginBottom:5}}>{f.label}</label>
                  <input type={f.type} className="input" placeholder={f.ph} min={f.min} max={f.max}
                    value={studyForm[f.key]} onChange={e=>setStudyForm(p=>({...p,[f.key]:e.target.value}))}/>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button className="btn btn-primary" style={{flex:1}} onClick={registerStudy}>Registrar</button>
              <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setShowStudy(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────
function HomePage({stats,modules,todayDone,setTodayDone,studyLog,setPage,setSelMod,toggleGR}){
  const today=new Date(); today.setHours(0,0,0,0);
  const pct=Math.min(100,Math.round((todayDone/DAILY_MIN)*100));
  const streak=calcStreak(studyLog);
  const grToday=modules.flatMap(m=>(m.generalReviews||[]).filter(r=>{const d=new Date(r.date);d.setHours(0,0,0,0);return r.status==="pendente"&&d<=today;}).map(r=>({...r,moduleName:m.name,moduleId:m.id})));
  return(
    <div>
      <div style={{marginBottom:22}}>
        <h1 style={{fontSize:24,fontFamily:"'DM Serif Display',serif"}}>Olá! 👩‍⚕️</h1>
        <p style={{color:"#888",fontSize:13,marginTop:3}}>Prova em <strong style={{color:"#6366f1"}}>{Math.max(0,daysFromNow(EXAM_DATE))} dias</strong> · 15 nov 2026</p>
      </div>

      {stats.vesp&&(
        <div style={{background:"linear-gradient(135deg,#dc2626,#b91c1c)",color:"#fff",borderRadius:14,padding:"14px 20px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:15,fontWeight:800}}>🔴 MODO VÉSPERA ATIVADO</div>
          <div style={{fontSize:12,opacity:.85,marginTop:2}}>Apenas revisão — temas mais importantes com menor desempenho primeiro</div></div>
          <div style={{fontSize:36}}>🚨</div>
        </div>
      )}

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        {[
          {label:"Questões feitas",value:stats.totalQ.toLocaleString(),icon:"✏️",color:"#6366f1"},
          {label:"Revisões feitas",value:stats.totalRev,icon:"🔁",color:"#10b981"},
          {label:"Módulos estudados",value:`${stats.studied}/${modules.length}`,icon:"📚",color:"#f59e0b"},
          {label:"Acertos globais",value:stats.globalAcc?`${stats.globalAcc}%`:"—",icon:"🎯",color:"#ec4899"},
        ].map(s=>(
          <div key={s.label} className="card" style={{padding:16}}>
            <div style={{fontSize:20,marginBottom:6}}>{s.icon}</div>
            <div style={{fontSize:20,fontWeight:800,color:s.color}}>{s.value}</div>
            <div style={{fontSize:11,color:"#888",marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Streak + Heatmap */}
      <div className="card" style={{padding:18,marginBottom:18,display:"flex",gap:28,alignItems:"flex-start",flexWrap:"wrap"}}>
        <div style={{flexShrink:0}}>
          <div style={{fontSize:11,color:"#888",marginBottom:4}}>🔥 Sequência</div>
          <div style={{fontSize:36,fontWeight:800,color:streak>=7?"#f59e0b":"#6366f1",lineHeight:1}}>{streak}<span style={{fontSize:14,fontWeight:400,color:"#aaa"}}> dias</span></div>
          <div style={{fontSize:11,color:"#aaa",marginTop:3}}>{streak===0?"Estude hoje!":streak>=7?"🏆 Incrível!":"Continue assim!"}</div>
        </div>
        <div style={{flex:1,minWidth:180}}>
          <div style={{fontSize:11,color:"#888",marginBottom:6}}>📅 Últimas 18 semanas</div>
          <HeatMap log={studyLog}/>
        </div>
      </div>

      {/* Meta diária */}
      <div className="card" style={{padding:18,marginBottom:18,background:pct>=100?"linear-gradient(135deg,#10b981,#059669)":"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontSize:12,opacity:.8}}>Meta diária mínima</div>
            <div style={{fontSize:26,fontWeight:800}}>{todayDone} / {DAILY_MIN} questões</div>
            <div style={{fontSize:11,opacity:.7,marginTop:2}}>{pct>=100?"✅ Meta atingida!":todayDone===0?"Vamos começar!": `Faltam ${DAILY_MIN-todayDone}`}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:32,fontWeight:800}}>{pct}%</div>
            <div style={{display:"flex",gap:6,marginTop:6,justifyContent:"flex-end"}}>
              {[[-10,"−10"],[10,"+10"],[20,"+20"],[30,"+30"]].map(([v,l])=>(
                <button key={l} onClick={()=>setTodayDone(d=>Math.max(0,d+v))}
                  style={{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",borderRadius:7,padding:"4px 9px",cursor:"pointer",fontWeight:700,fontSize:12}}>{l}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{height:7,background:"rgba(255,255,255,.25)",borderRadius:4,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:"#fff",borderRadius:4,transition:"width .4s"}}/>
        </div>
      </div>

      {/* Plano do dia */}
      <div className="card" style={{padding:20,marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div style={{fontWeight:700,fontSize:15}}>{stats.vesp?"🔴 Plano — Modo Véspera":"📋 Plano de revisões de hoje"}</div>
          <div style={{fontSize:12,color:"#888"}}>{stats.plan.reduce((s,m)=>s+m.suggestedQ,0)} questões sugeridas</div>
        </div>
        <p style={{fontSize:12,color:"#aaa",marginBottom:14}}>{stats.vesp?"Revisão intensa — mais prevalente + pior desempenho":"Baseado em incidência + desempenho + tempo sem contato"}</p>
        {stats.plan.length===0&&<div style={{color:"#aaa",fontSize:13,textAlign:"center",padding:"16px 0"}}>Nenhuma revisão pendente. Registre seus estudos nos Módulos!</div>}
        {stats.plan.slice(0,8).map((m,i)=>{
          const pl=prevLabel(m.prevalenceScore,MAX_PREV);
          return(
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid #f5f5f8"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"#fef2f2":"#f5f5fb",color:i===0?"#dc2626":"#6366f1",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,flexShrink:0}}>{i+1}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:13,fontWeight:700}}>{m.name}</span>
                  <span style={{fontSize:10,fontWeight:700,color:pl.color,background:pl.bg,padding:"1px 7px",borderRadius:20}}>{pl.emoji} {pl.label}</span>
                  {m.avgAccuracy>0&&<span style={{fontSize:11,color:m.avgAccuracy<60?"#dc2626":m.avgAccuracy>=80?"#10b981":"#f59e0b",fontWeight:600}}>{m.avgAccuracy}%</span>}
                </div>
                <div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>
                  {m.reasons.map(r=><span key={r} style={{fontSize:10,color:"#888",background:"#f5f5f8",padding:"1px 7px",borderRadius:20}}>{r}</span>)}
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:18,fontWeight:800,color:"#6366f1"}}>{m.suggestedQ}</div>
                <div style={{fontSize:10,color:"#888"}}>questões</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={()=>setSelMod(m)}>Registrar</button>
            </div>
          );
        })}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* Revisões gerais */}
        <div className="card" style={{padding:18}}>
          <div style={{fontWeight:700,marginBottom:12}}>📖 Revisões Gerais Pendentes</div>
          {grToday.length===0&&<div style={{color:"#aaa",fontSize:13}}>Nenhuma pendente.</div>}
          {grToday.slice(0,5).map(r=>(
            <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #f5f5f8"}}>
              <div><div style={{fontSize:13,fontWeight:600}}>{r.moduleName}</div><div style={{fontSize:11,color:"#888"}}>Revisão Geral</div></div>
              <button className="btn btn-sm" style={{background:"#ecfdf5",color:"#10b981",border:"none"}} onClick={()=>toggleGR(r.moduleId,r.id)}>Marcar feita</button>
            </div>
          ))}
        </div>
        {/* Progresso */}
        <div className="card" style={{padding:18}}>
          <div style={{fontWeight:700,marginBottom:12}}>📊 Progresso geral</div>
          {[
            {label:"Questões",val:stats.totalQ,max:TARGET_Q,color:"#6366f1",fmt:v=>v.toLocaleString()},
            {label:"Módulos concluídos",val:stats.concluded,max:modules.length,color:"#10b981",fmt:v=>v},
            {label:"Módulos estudados",val:stats.studied,max:modules.length,color:"#f59e0b",fmt:v=>v},
          ].map(p=>(
            <div key={p.label} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                <span>{p.label}</span><span style={{fontWeight:700,color:p.color}}>{p.fmt(p.val)} / {p.fmt(p.max)}</span>
              </div>
              <div className="pbar"><div className="pfill" style={{width:`${Math.min(100,(p.val/p.max)*100)}%`,background:p.color}}/></div>
            </div>
          ))}
          <button className="btn" style={{width:"100%",marginTop:6,background:"#fef2f2",color:"#dc2626",border:"none",padding:"10px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}} onClick={()=>setPage("errors")}>
            📝 Abrir Caderno de Erros
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODULES PAGE
// ─────────────────────────────────────────────
function ModulesPage({modules,onOpen,toggleStar}){
  const [view,setView]=useState("geral"); // "geral" | area name
  const [search,setSearch]=useState("");
  const [filterStatus,setFilterStatus]=useState("Todos");
  const statusColor={"não estudado":"#d1d5db","em andamento":"#f59e0b","concluído":"#10b981"};

  const filtered=modules.filter(m=>{
    if(search&&!m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if(filterStatus!=="Todos"&&m.status!==filterStatus) return false;
    if(view!=="geral"&&m.area!==view) return false;
    return true;
  });

  // Group by area for "geral" view
  const grouped=view==="geral"
    ? GRANDES_AREAS.map(area=>({area,items:filtered.filter(m=>m.area===area)})).filter(g=>g.items.length>0)
    : [{area:view,items:filtered}];

  const today=new Date(); today.setHours(0,0,0,0);

  return(
    <div>
      <div style={{marginBottom:20}}>
        <h1 style={{fontSize:22,fontFamily:"'DM Serif Display',serif"}}>Módulos</h1>
        <p style={{fontSize:12,color:"#888",marginTop:3}}>Ordenados por prevalência dentro de cada área</p>
      </div>

      {/* View switcher */}
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {[{id:"geral",label:"🗺 Visão Geral"},...GRANDES_AREAS.map(a=>({id:a,label:`${AREA_ICON[a]} ${a}`}))].map(v=>(
          <button key={v.id} className="btn btn-sm" style={{background:view===v.id?"#6366f1":"#f5f5fb",color:view===v.id?"#fff":"#555",border:"none",cursor:"pointer",fontSize:12}}
            onClick={()=>setView(v.id)}>{v.label}</button>
        ))}
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        <input className="input" style={{maxWidth:200,fontSize:13}} placeholder="Buscar módulo..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select className="input" style={{maxWidth:160,fontSize:13}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option>Todos</option><option value="não estudado">Não estudado</option>
          <option value="em andamento">Em andamento</option><option value="concluído">Concluído</option>
        </select>
      </div>

      {grouped.map(({area,items})=>(
        <div key={area} style={{marginBottom:28}}>
          {view==="geral"&&(
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,paddingBottom:8,borderBottom:`2px solid ${AREA_COLOR[area]}30`}}>
              <span style={{fontSize:18}}>{AREA_ICON[area]}</span>
              <span style={{fontSize:16,fontWeight:700,color:AREA_COLOR[area]}}>{area}</span>
              <span style={{fontSize:12,color:"#aaa"}}>{items.length} módulos</span>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
            {items.map((m,rank)=>{
              const pl=prevLabel(m.prevalenceScore,MAX_PREV);
              const isNotStudied=m.status==="não estudado";
              const isOverdue=m.nextReview&&new Date(m.nextReview)<today;
              const isDueToday=m.nextReview&&new Date(m.nextReview)>=today&&new Date(m.nextReview)<addDays(today,1);
              const globalRank=modules.findIndex(mm=>mm.id===m.id)+1;
              return(
                <div key={m.id} className="mod-card" style={{opacity:isNotStudied?0.6:1}} onClick={()=>onOpen(m)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                        <span style={{fontSize:10,fontWeight:800,color:"#aaa"}}>#{globalRank}</span>
                        <span className="tag" style={{background:pl.bg,color:pl.color}}>{pl.emoji} {pl.label} incidência</span>
                      </div>
                      <div style={{fontSize:13,fontWeight:700,lineHeight:1.3}}>{m.name}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0,marginLeft:8}}>
                      <button onClick={e=>{e.stopPropagation();toggleStar(m.id);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:m.starred?"#f59e0b":"#d1d5db"}}>★</button>
                      <div style={{width:8,height:8,borderRadius:"50%",background:statusColor[m.status]}}/>
                    </div>
                  </div>
                  {!isNotStudied&&(
                    <>
                      <div style={{display:"flex",gap:10,fontSize:11,color:"#888",marginBottom:8}}>
                        <span>{m.totalQuestions} questões</span>
                        <span style={{color:m.avgAccuracy>=70?"#10b981":"#f59e0b",fontWeight:600}}>{m.avgAccuracy}% acertos</span>
                        <span>{m.history.length} revisões</span>
                      </div>
                      <div className="pbar" style={{marginBottom:6}}><div className="pfill" style={{width:`${m.avgAccuracy}%`,background:m.avgAccuracy>=70?"#10b981":"#f59e0b"}}/></div>
                      {isOverdue&&<span className="tag" style={{background:"#fef2f2",color:"#dc2626"}}>⚠ Atrasado</span>}
                      {isDueToday&&<span className="tag" style={{background:"#f0fdf4",color:"#16a34a"}}>📅 Hoje</span>}
                      {!isOverdue&&!isDueToday&&m.nextReview&&<span style={{fontSize:11,color:"#aaa"}}>Próxima: {fmt(m.nextReview)}</span>}
                    </>
                  )}
                  {isNotStudied&&<div style={{fontSize:11,color:"#aaa",marginTop:4}}>Não iniciado · {m.topics.length} temas</div>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// MODULE DETAIL
// ─────────────────────────────────────────────
function ModuleDetail({mod:m,onBack,onStudy,toggleGR,onDelete}){
  const pl=prevLabel(m.prevalenceScore,MAX_PREV);
  const statusColor={"não estudado":"#d1d5db","em andamento":"#f59e0b","concluído":"#10b981"};
  const statusLabel={"não estudado":"Não estudado","em andamento":"Em andamento","concluído":"Concluído"};
  const globalRank=MODULES_INITIAL.findIndex(mm=>mm.id===m.id)+1;
  return(
    <div>
      <button className="btn btn-ghost btn-sm" style={{marginBottom:18}} onClick={onBack}>← Voltar</button>
      <div className="card" style={{padding:22,marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
              <span style={{fontSize:11,fontWeight:800,color:"#aaa"}}>#{globalRank} de {MODULES_INITIAL.length}</span>
              <span className="tag" style={{background:pl.bg,color:pl.color}}>{pl.emoji} {pl.label} incidência</span>
              <span className="tag" style={{background:statusColor[m.status]+"20",color:statusColor[m.status]}}>● {statusLabel[m.status]}</span>
            </div>
            <h1 style={{fontSize:20,fontFamily:"'DM Serif Display',serif",marginBottom:3}}>{m.name}</h1>
            <div style={{fontSize:12,color:AREA_COLOR[m.area],fontWeight:600}}>{AREA_ICON[m.area]} {m.area}</div>
          </div>
          <button className="btn btn-primary" onClick={onStudy}>+ Registrar estudo</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:18}}>
          {[
            {label:"Total questões",val:m.totalQuestions||"—"},
            {label:"Revisões",val:m.history.length},
            {label:"Acertos",val:m.avgAccuracy?`${m.avgAccuracy}%`:"—"},
            {label:"Próxima revisão",val:fmt(m.nextReview)},
          ].map(s=>(
            <div key={s.label} style={{background:"#f8f8fb",borderRadius:10,padding:12}}>
              <div style={{fontSize:18,fontWeight:800,color:"#6366f1"}}>{s.val}</div>
              <div style={{fontSize:11,color:"#888"}}>{s.label}</div>
            </div>
          ))}
        </div>
        {m.history.length>=2&&<div style={{marginTop:14}}><div style={{fontSize:12,color:"#888",marginBottom:6}}>Evolução de acertos</div><Sparkline history={m.history}/></div>}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        {/* Temas */}
        <div className="card" style={{padding:18}}>
          <div style={{fontWeight:700,marginBottom:10}}>📚 Temas ({m.topics.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:260,overflowY:"auto"}}>
            {m.topics.map(t=><div key={t} style={{fontSize:12,padding:"5px 10px",background:"#f8f8fb",borderRadius:7}}>{t}</div>)}
          </div>
        </div>
        {/* Revisões Gerais */}
        <div className="card" style={{padding:18}}>
          <div style={{fontWeight:700,marginBottom:10}}>📖 Revisões Gerais</div>
          {(!m.generalReviews||!m.generalReviews.length)&&<div style={{color:"#aaa",fontSize:13}}>Geradas após o primeiro estudo.</div>}
          {(m.generalReviews||[]).map((r,i)=>(
            <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #f5f5f8"}}>
              <div><div style={{fontSize:13,fontWeight:600}}>Revisão Geral {i+1}</div><div style={{fontSize:11,color:"#888"}}>{fmt(r.date)}</div></div>
              <button className="btn btn-sm" style={{background:r.status==="feita"?"#ecfdf5":"#f5f5fb",color:r.status==="feita"?"#10b981":"#888",border:"none"}} onClick={()=>toggleGR(m.id,r.id)}>
                {r.status==="feita"?"✓ Feita":"Pendente"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="card" style={{padding:20}}>
        <div style={{fontWeight:700,marginBottom:16}}>🕒 Linha do tempo de estudos</div>
        <Timeline history={m.history} onDelete={idx=>onDelete(m.id,idx)}/>
        {m.nextReview&&m.history.length>0&&(
          <div style={{marginTop:12,padding:"10px 14px",background:"#eef2ff",borderRadius:10,fontSize:13,color:"#6366f1",fontWeight:600}}>
            🔜 Próxima revisão sugerida: {fmt(m.nextReview)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SCHEDULE PAGE
// ─────────────────────────────────────────────
function SchedulePage({modules,setSelMod,toggleGR}){
  const today=new Date(); today.setHours(0,0,0,0);
  const overdue=modules.filter(m=>m.nextReview&&new Date(m.nextReview)<today&&m.status!=="não estudado").sort((a,b)=>new Date(a.nextReview)-new Date(b.nextReview));
  const dueToday=modules.filter(m=>m.nextReview&&new Date(m.nextReview)>=today&&new Date(m.nextReview)<addDays(today,1));
  const upcoming=modules.filter(m=>m.nextReview&&new Date(m.nextReview)>=addDays(today,1)).sort((a,b)=>new Date(a.nextReview)-new Date(b.nextReview)).slice(0,15);
  const grAll=modules.flatMap(m=>(m.generalReviews||[]).filter(r=>r.status==="pendente").map(r=>({...r,moduleName:m.name,moduleId:m.id,pl:prevLabel(m.prevalenceScore,MAX_PREV)}))).sort((a,b)=>new Date(a.date)-new Date(b.date));

  const Section=({title,items,color,renderItem})=>(
    <div className="card" style={{padding:18,marginBottom:16}}>
      <div style={{fontWeight:700,marginBottom:12,display:"flex",justifyContent:"space-between"}}>
        <span style={{color}}>{title}</span><span style={{fontSize:12,color:"#888"}}>{items.length}</span>
      </div>
      {!items.length&&<div style={{color:"#aaa",fontSize:13}}>Nenhum item.</div>}
      {items.map(renderItem)}
    </div>
  );

  return(
    <div>
      <h1 style={{fontSize:22,fontFamily:"'DM Serif Display',serif",marginBottom:20}}>Agenda de Revisões</h1>
      <Section title="⚠️ Atrasadas" items={overdue} color="#dc2626" renderItem={m=>(
        <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f5f5f8"}}>
          <div>
            <div style={{fontSize:13,fontWeight:600}}>{m.name}</div>
            <div style={{fontSize:11,color:"#dc2626"}}>Deveria: {fmt(m.nextReview)} · {m.avgAccuracy}% acertos</div>
          </div>
          <button className="btn btn-primary btn-sm" style={{background:"#dc2626"}} onClick={()=>setSelMod(m)}>Revisar</button>
        </div>
      )}/>
      <Section title="📅 Para hoje" items={dueToday} color="#10b981" renderItem={m=>(
        <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f5f5f8"}}>
          <div>
            <div style={{fontSize:13,fontWeight:600}}>{m.name}</div>
            <div style={{fontSize:11,color:"#888"}}>{m.area} · {m.avgAccuracy}% acertos · {m.history.length} revisões</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={()=>setSelMod(m)}>Estudar</button>
        </div>
      )}/>
      <Section title="📖 Revisões Gerais Pendentes" items={grAll} color="#8b5cf6" renderItem={r=>(
        <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f5f5f8"}}>
          <div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:600}}>{r.moduleName}</span>
              <span className="tag" style={{background:r.pl.bg,color:r.pl.color,fontSize:10}}>{r.pl.emoji} {r.pl.label}</span>
            </div>
            <div style={{fontSize:11,color:new Date(r.date)<today?"#dc2626":"#888"}}>{new Date(r.date)<today?"⚠ Atrasada":"Pendente"} · {fmt(r.date)}</div>
          </div>
          <button className="btn btn-sm" style={{background:"#f5f0ff",color:"#8b5cf6",border:"none",cursor:"pointer",fontWeight:600}} onClick={()=>toggleGR(r.moduleId,r.id)}>Marcar feita</button>
        </div>
      )}/>
      <Section title="🔜 Próximas" items={upcoming} color="#6366f1" renderItem={m=>(
        <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f5f5f8"}}>
          <div>
            <div style={{fontSize:13,fontWeight:600}}>{m.name}</div>
            <div style={{fontSize:11,color:"#888"}}>{fmt(m.nextReview)}</div>
          </div>
          <span style={{fontSize:13,color:"#6366f1",fontWeight:600}}>em {daysFromNow(new Date(m.nextReview))}d</span>
        </div>
      )}/>
    </div>
  );
}

// ─────────────────────────────────────────────
// PERFORMANCE PAGE
// ─────────────────────────────────────────────
function PerformancePage({modules,stats}){
  const studied=modules.filter(m=>m.status!=="não estudado"&&m.avgAccuracy>0);
  const byArea=GRANDES_AREAS.map(area=>{
    const mods=studied.filter(m=>m.area===area);
    const avg=mods.length?Math.round(mods.reduce((s,m)=>s+m.avgAccuracy,0)/mods.length):0;
    const total=mods.reduce((s,m)=>s+m.totalQuestions,0);
    return{area,avg,total,count:mods.length};
  });
  const strongest=[...studied].sort((a,b)=>b.avgAccuracy-a.avgAccuracy).slice(0,5);
  const weakest=[...studied].sort((a,b)=>a.avgAccuracy-b.avgAccuracy).slice(0,5);
  return(
    <div>
      <h1 style={{fontSize:22,fontFamily:"'DM Serif Display',serif",marginBottom:20}}>Desempenho</h1>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
        <div className="card" style={{padding:18,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff"}}>
          <div style={{fontSize:12,opacity:.8}}>Acertos globais</div>
          <div style={{fontSize:34,fontWeight:800}}>{stats.globalAcc}%</div>
          <div style={{marginTop:10,height:5,background:"rgba(255,255,255,.3)",borderRadius:3}}>
            <div style={{height:"100%",width:`${stats.globalAcc}%`,background:"#fff",borderRadius:3}}/>
          </div>
        </div>
        <div className="card" style={{padding:18}}>
          <div style={{fontSize:12,color:"#888"}}>Total de questões</div>
          <div style={{fontSize:34,fontWeight:800,color:"#6366f1"}}>{stats.totalQ.toLocaleString()}</div>
          <div style={{fontSize:11,color:"#aaa"}}>meta: {TARGET_Q.toLocaleString()}</div>
          <div className="pbar" style={{marginTop:8}}><div className="pfill" style={{width:`${Math.min(100,(stats.totalQ/TARGET_Q)*100)}%`,background:"#6366f1"}}/></div>
        </div>
        <div className="card" style={{padding:18}}>
          <div style={{fontSize:12,color:"#888"}}>Módulos estudados</div>
          <div style={{fontSize:34,fontWeight:800,color:"#10b981"}}>{Math.round((stats.studied/modules.length)*100)}%</div>
          <div style={{fontSize:11,color:"#aaa"}}>{stats.studied} de {modules.length}</div>
        </div>
      </div>
      <div className="card" style={{padding:18,marginBottom:16}}>
        <div style={{fontWeight:700,marginBottom:14}}>Por Grande Área</div>
        {byArea.map(a=>(
          <div key={a.area} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontSize:13,fontWeight:600,color:AREA_COLOR[a.area]}}>{AREA_ICON[a.area]} {a.area}</span>
              <span style={{fontSize:13,color:"#888"}}>{a.avg?`${a.avg}%`:"—"} · {a.total} questões</span>
            </div>
            <div className="pbar"><div className="pfill" style={{width:`${a.avg}%`,background:AREA_COLOR[a.area]}}/></div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div className="card" style={{padding:18}}>
          <div style={{fontWeight:700,marginBottom:12,color:"#10b981"}}>💪 Pontos fortes</div>
          {!strongest.length&&<div style={{color:"#aaa",fontSize:13}}>Sem dados ainda.</div>}
          {strongest.map(m=>(
            <div key={m.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f5f5f8"}}>
              <span style={{fontSize:13}}>{m.name}</span><span style={{fontWeight:700,color:"#10b981",fontSize:13}}>{m.avgAccuracy}%</span>
            </div>
          ))}
        </div>
        <div className="card" style={{padding:18}}>
          <div style={{fontWeight:700,marginBottom:12,color:"#dc2626"}}>⚠️ Precisam de atenção</div>
          {!weakest.length&&<div style={{color:"#aaa",fontSize:13}}>Sem dados ainda.</div>}
          {weakest.map(m=>(
            <div key={m.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f5f5f8"}}>
              <span style={{fontSize:13}}>{m.name}</span><span style={{fontWeight:700,color:"#dc2626",fontSize:13}}>{m.avgAccuracy}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ERRORS PAGE — Smart Notebook
// ─────────────────────────────────────────────

const NOTEBOOK_AREAS = [
  "Clínica Médica",
  "Clínica Cirúrgica", 
  "Pediatria",
  "Ginecologia e Obstetrícia",
  "Preventiva & Social",
];

// Pre-loaded notes from user
const PRELOADED_NOTES = {
  "Ginecologia e Obstetrícia": `<h2 id="obstetricia" data-anchor="Obstetrícia">Obstetrícia</h2>
<p><strong>Gestante aloimunizada com Doppler da ACM ≥ 1,5 MoM</strong> deve ser submetida à <strong>cordocentese</strong> para dosagem de hemoglobina e hematócrito</p>
<ul>
<li>Realizar transfusão intrauterina caso indicado</li>
<li>Gestações abaixo de 34 semanas, a transfusão intrauterina é preferível à antecipação do parto</li>
</ul>`,

  "Clínica Cirúrgica": `<h2 id="trauma" data-anchor="Trauma">Trauma</h2>
<h3 id="rolamento" data-anchor="Rolamento em Bloco">Rolamento em Bloco</h3>
<ul>
<li>Avaliação secundária - final da avaliação - exame do dorso</li>
<li>Avaliação primária - buscar fonte de sangramento ativo</li>
</ul>
<h3 id="lesao-cervical" data-anchor="Lesão Cervical">Lesão Cervical</h3>
<ul>
<li>Critérios NEXUS - baixo risco - se os 5 presentes → examinar dorso → exame neurológico sumário → pode retirar prancha e colar
<ul>
<li>Sem dor</li>
<li>Sem déficit neurológico focal</li>
<li>Nível de consciência normal</li>
<li>Sem intoxicações</li>
<li>Sem lesões distrativas</li>
</ul>
</li>
</ul>
<h3 id="triade-letal" data-anchor="Tríade Letal do Trauma">Tríade Letal do Trauma</h3>
<p><strong>Coloides não são recomendados na ressuscitação do trauma pelo ATLS; o fluido preconizado é o cristaloide isotônico</strong></p>
<p><strong>A tríade letal do trauma é composta por hipotermia, acidose e coagulopatia.</strong> Os limiares associados a coagulopatia grave e aumento de mortalidade em politraumatizados são:</p>
<ul>
<li>Temperatura central menor que 34°C</li>
<li>pH sanguíneo menor que 7,2</li>
<li>ISS maior que 25</li>
<li>Pressão arterial sistólica menor que 70 mmHg</li>
<li>TAP e TTPa prolongados acima de 1,5 a 2 vezes o normal</li>
</ul>
<p><strong>Atenção especial à direção dos valores: hipotermia e acidose significam valores abaixo dos limiares, enquanto o ISS deve estar acima de 25.</strong></p>
<h3 id="rotem" data-anchor="ROTEM — Tromboelastometria">ROTEM — Tromboelastometria Rotacional</h3>
<ul>
<li>Via extrínseca (EXTEM)
<ul>
<li>Prolongamento do tempo de coagulação → plasma fresco congelado ou complexo protrombínico (fatores dependentes de Vit K)</li>
<li>Redução da firmeza do coágulo → trombocitopenia → transfusão de plaquetas</li>
</ul>
</li>
<li>Via intrínseca (INTEM)</li>
<li>Fibrinogênio (FIBTEM)
<ul>
<li>Redução da firmeza do coágulo → Hipofibrinogenemia → concentrado de fibrinogênio ou crioprecipitado</li>
</ul>
</li>
<li>Aprotinina - confirmar hiperfibrinólise (APTEM)</li>
</ul>
<p>Hiperfibrinólise - ROTEM - Lise máxima acima de 15% no EXTEM → <strong>TRATAR com Antifibrinolíticos (Tranexâmico!)</strong></p>
<h3 id="teg" data-anchor="Tromboelastografia (TEG)">Tromboelastografia (TEG)</h3>
<p><strong>Na tromboelastografia, cada parâmetro alterado aponta para uma conduta específica:</strong></p>
<ul>
<li>Tempo R prolongado → plasma fresco congelado (deficiência de fatores)</li>
<li>Ângulo alfa reduzido → crioprecipitado (hipofibrinogenemia)</li>
<li>Amplitude máxima (MA) reduzida → plaquetas (trombocitopenia ou disfunção plaquetária)</li>
<li>LY30 elevado → ácido tranexâmico (hiperfibrinólise)</li>
</ul>
<p><strong>No trauma grave, a hiperfibrinólise é uma causa tratável de coagulopatia, e o ácido tranexâmico deve ser administrado precocemente, idealmente nas primeiras 3 horas, na dose de 1g IV seguido de 1g em 8 horas.</strong></p>
<h3 id="torniquete" data-anchor="Torniquete">Torniquete</h3>
<ul>
<li>Aplicação correta deve ocluir sangramento venoso e arterial</li>
<li>Deflação do torniquete somente se paciente estável — se cirurgia exceder 2 horas</li>
<li>Torniquete pneumático:
<ul>
<li>MMII em torno de 400 mmHg</li>
<li>MMSS em torno de 250 mmHg</li>
</ul>
</li>
</ul>
<h3 id="ptm" data-anchor="Protocolo de Transfusão Maciça">Protocolo de Transfusão Maciça</h3>
<ul>
<li>Risco de Hipocalcemia - tem citrato em todos os componentes</li>
<li>Fluidos e componentes devem ser aquecidos entre 39–42°C</li>
<li>Autotransfusão em hemotórax maciço - fazer reposição de plasma e plaquetas junto!</li>
</ul>
<h3 id="choque" data-anchor="Choque Hipovolêmico">Choque Hipovolêmico e Tipos de Choque</h3>
<p>Perda de volume intravascular → Reduz pré-carga → PVC baixa e POAP baixa</p>
<p><strong>Para diferenciar os tipos de choque pela hemodinâmica, concentre-se em dois eixos: pressões de enchimento (PVC e POAP) e resistência vascular sistêmica (RVS):</strong></p>
<ul>
<li>Choque hipovolêmico: PVC e POAP baixas, DC baixo, RVS alta, SvO₂ baixa</li>
<li>Choque cardiogênico: PVC e POAP altas, DC baixo, RVS alta, SvO₂ baixa</li>
<li>Choque obstrutivo: PVC alta, DC baixo, RVS alta (POAP varia conforme a causa)</li>
<li>Choque distributivo (séptico): PVC variável, RVS baixa, DC normal ou alto (fase hiperdinâmica), SvO₂ normal ou elevada</li>
</ul>
<p><strong>O que diferencia hipovolêmico de cardiogênico são as pressões de enchimento: baixas no primeiro, altas no segundo.</strong></p>
<h2 id="cirurgia-geral" data-anchor="Cirurgia Geral">Cirurgia Geral</h2>
<h3 id="fitoterápicos" data-anchor="Fitoterápicos no Pré-op">Fitoterápicos no Pré-operatório</h3>
<ul>
<li>Erva de São João - Antidepressivo (ISRS, nora e dopamina)
<ul>
<li>Reduz concentrações de ACO, opioides, warfarina</li>
<li><strong>Suspender 5 dias antes</strong></li>
</ul>
</li>
<li>Kava - ansiolítico, sedativo e miorrelaxante
<ul>
<li>Potencializa efeito sedativo de anestésicos e BZD</li>
<li><strong>Suspender 24 horas antes</strong></li>
</ul>
</li>
<li>Ginseng - Hipoglicemia e inibe agregação plaquetária
<ul>
<li><strong>Suspender 7 dias antes</strong></li>
</ul>
</li>
<li>Alho - propriedades cardiovasculares
<ul>
<li>Inibe agregação plaquetária de forma irreversível</li>
<li><strong>Suspender 7 dias antes</strong></li>
</ul>
</li>
<li>Ginkgo Biloba - cognição e circulação periférica
<ul>
<li>Inibe fator de agregação plaquetária = sangramento</li>
<li><strong>Suspender 36h antes</strong></li>
</ul>
</li>
<li>Efedra - <strong>pelo menos 24h antes</strong></li>
</ul>`,

  "Clínica Médica": `<h2 id="infectologia" data-anchor="Infectologia">Infectologia</h2>
<h3 id="bacteremia" data-anchor="Bacteremia e Dispositivos Cardíacos">Bacteremia e Dispositivos Cardíacos</h3>
<p><strong>Bacteremia (especialmente S. Aureus) em paciente com dispositivos cardíacos = RETIRAR, mesmo sem vegetações visíveis</strong></p>
<ul>
<li>Sempre fazer ECOTE, mas retirada não depende do resultado</li>
<li>Hemocultura de controle a cada 48h até negativação</li>
<li>Sintomas osteoarticulares → osteomielite (espondilodiscite) → fazer RM</li>
</ul>
<p>Dosagem de vancomicina - após 3ª~4ª dose - repetindo a cada 3 a 5 dias</p>`,
};

// Smart TOC extraction from HTML content
function extractTOC(html) {
  if (!html) return [];
  const div = document.createElement('div');
  div.innerHTML = html;
  const anchors = [];
  div.querySelectorAll('[data-anchor]').forEach(el => {
    anchors.push({
      id: el.id,
      label: el.getAttribute('data-anchor'),
      level: el.tagName === 'H2' ? 1 : 2,
    });
  });
  return anchors;
}

// Generate unique ID from text
function makeId(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Today date string
function todayStr() {
  return new Date().toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit',year:'numeric'});
}

// AI Import using Claude API
async function classifyAndInsert(text) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Você é um assistente médico especializado em residência médica brasileira.

Analise o texto abaixo e retorne APENAS um JSON válido (sem markdown, sem explicações) com esta estrutura:
{
  "area": "uma das 5 opções: Clínica Médica | Clínica Cirúrgica | Pediatria | Ginecologia e Obstetrícia | Preventiva & Social",
  "subtema": "nome da especialidade/subespecialidade (ex: Pneumologia, Trauma, Obstetrícia, Cardiologia)",
  "titulo": "título curto para esta anotação (max 5 palavras)"
}

Texto:
${text.slice(0, 800)}`
        }]
      })
    });
    const data = await res.json();
    const raw = data.content?.[0]?.text || '{}';
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch(e) {
    return { area: 'Clínica Médica', subtema: 'Geral', titulo: 'Anotação importada' };
  }
}

function ErrorsPage({ notebooks, setNotebooks }) {
  const [activeArea, setActiveArea] = useState('Clínica Médica');
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [toc, setToc] = useState([]);
  const editorRef = useRef(null);
  const saveTimer = useRef(null);
  const [showHL, setShowHL] = useState(false);
  const HIGHLIGHT_COLORS = ['#fef08a','#bbf7d0','#bfdbfe','#fecaca','#e9d5ff'];

  // Initialize with preloaded notes if empty
  useEffect(() => {
    setNotebooks(prev => {
      const next = { ...prev };
      NOTEBOOK_AREAS.forEach(area => {
        if (!next[area] && PRELOADED_NOTES[area]) {
          next[area] = PRELOADED_NOTES[area];
        }
      });
      return next;
    });
  }, []);

  // Load content into editor when area or mode changes
  useEffect(() => {
    if (editMode && editorRef.current) {
      const content = notebooks[activeArea] || '<p><br></p>';
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [activeArea, editMode]);

  // Extract TOC whenever content changes
  useEffect(() => {
    const content = notebooks[activeArea] || '';
    const div = document.createElement('div');
    div.innerHTML = content;
    const items = [];
    div.querySelectorAll('h2, h3').forEach(el => {
      const anchor = el.getAttribute('data-anchor') || el.textContent;
      const id = el.id || makeId(el.textContent);
      items.push({ id, label: anchor, level: el.tagName === 'H2' ? 1 : 2 });
    });
    setToc(items);
  }, [notebooks, activeArea]);

  function handleInput() {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setNotebooks(prev => ({ ...prev, [activeArea]: html }));
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
    // Update TOC live
    const div = document.createElement('div');
    div.innerHTML = html;
    const items = [];
    div.querySelectorAll('h2, h3').forEach(el => {
      const anchor = el.getAttribute('data-anchor') || el.textContent;
      const id = el.id || makeId(el.textContent);
      items.push({ id, label: anchor, level: el.tagName === 'H2' ? 1 : 2 });
    });
    setToc(items);
  }

  function execCmd(cmd, val) {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(cmd, false, val || null);
    setTimeout(handleInput, 50);
  }

  function insertHeading(level) {
    const sel = window.getSelection();
    const text = sel && sel.toString() ? sel.toString() : 'Novo título';
    const id = makeId(text);
    const tag = level === 1 ? 'h2' : 'h3';
    const style = level === 1
      ? 'font-size:20px;font-weight:800;color:#1a1a2e;margin:20px 0 8px;padding-bottom:6px;border-bottom:2px solid #6366f120'
      : 'font-size:16px;font-weight:700;color:#374151;margin:16px 0 6px';
    document.execCommand('insertHTML', false,
      `<${tag} id="${id}" data-anchor="${text}" style="${style}">${text}</${tag}><p><br></p>`
    );
    setTimeout(handleInput, 50);
  }

  function insertHighlight(color) {
    const sel = window.getSelection();
    if (!sel || !sel.toString()) return;
    document.execCommand('insertHTML', false,
      `<mark style="background:${color};padding:1px 4px;border-radius:3px">${sel.toString()}</mark>`
    );
    setShowHL(false);
    setTimeout(handleInput, 50);
  }

  function insertReviewMark() {
    const sel = window.getSelection();
    const txt = sel && sel.toString() ? sel.toString() : '';
    const date = todayStr();
    document.execCommand('insertHTML', false,
      `<mark style="background:#fef3c7;padding:2px 6px;border-radius:4px;border-left:3px solid #f59e0b;font-weight:600">🔖 ${txt || 'Para revisar'} <span style="font-size:10px;color:#92400e;font-weight:400">${date}</span></mark>`
    );
    setTimeout(handleInput, 50);
  }

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = ev => {
          document.execCommand('insertHTML', false,
            `<div style="margin:10px 0"><img src="${ev.target.result}" style="max-width:100%;border-radius:8px;border:1.5px solid #e5e5eb"/></div>`
          );
          setTimeout(handleInput, 50);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  function scrollToAnchor(id) {
    // If in edit mode, scroll editor; if read mode, scroll preview
    const container = document.getElementById('notebook-content');
    if (!container) return;
    const target = container.querySelector(`#${id}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (editorRef.current) {
      const t = editorRef.current.querySelector(`#${id}`);
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async function handleImport() {
    if (!importText.trim()) return;
    setImporting(true);
    const result = await classifyAndInsert(importText);
    setImportResult(result);
    setImporting(false);
  }

  function confirmImport() {
    if (!importResult) return;
    const { area, subtema, titulo } = importResult;
    const date = todayStr();
    const id = makeId(subtema);
    const existing = notebooks[area] || '';
    // Check if subtema heading already exists
    const hasHeading = existing.includes(`data-anchor="${subtema}"`);
    const headingHtml = hasHeading ? '' :
      `<h2 id="${id}" data-anchor="${subtema}" style="font-size:20px;font-weight:800;color:#1a1a2e;margin:20px 0 8px;padding-bottom:6px;border-bottom:2px solid #6366f120">${subtema}</h2>`;
    const noteHtml = `${headingHtml}<h3 id="${makeId(titulo)}" data-anchor="${titulo}" style="font-size:15px;font-weight:700;color:#374151;margin:14px 0 6px">${titulo} <span style="font-size:10px;color:#aaa;font-weight:400">${date}</span></h3><p>${importText.replace(/
/g, '</p><p>')}</p>`;
    setNotebooks(prev => ({ ...prev, [area]: (prev[area] || '') + noteHtml }));
    setImportText('');
    setImportResult(null);
    setShowImport(false);
    setActiveArea(area);
  }

  // Collect all review marks across all areas
  const allReviewMarks = useMemo(() => {
    const marks = [];
    NOTEBOOK_AREAS.forEach(area => {
      const html = notebooks[area] || '';
      const div = document.createElement('div');
      div.innerHTML = html;
      div.querySelectorAll('mark').forEach(m => {
        if (m.innerHTML.includes('🔖')) {
          marks.push({ area, text: m.textContent, html: m.outerHTML });
        }
      });
    });
    return marks;
  }, [notebooks]);

  // Search across all areas
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const results = [];
    NOTEBOOK_AREAS.forEach(area => {
      const html = notebooks[area] || '';
      const div = document.createElement('div');
      div.innerHTML = html;
      const text = div.textContent;
      const lower = text.toLowerCase();
      const q = search.toLowerCase();
      if (lower.includes(q)) {
        // Find context
        const idx = lower.indexOf(q);
        const context = text.slice(Math.max(0, idx - 60), idx + 100);
        results.push({ area, context, query: search });
      }
    });
    return results;
  }, [search, notebooks]);

  function countSections(area) {
    const html = notebooks[area] || '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.querySelectorAll('h2, h3').length;
  }

  function exportPDF() {
    const html = notebooks[activeArea] || '<p>Caderno vazio.</p>';
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <title>Caderno — ${activeArea}</title>
    <style>
      body{font-family:Georgia,serif;max-width:820px;margin:40px auto;padding:0 40px;color:#1a1a2e;line-height:1.85}
      h2{font-size:22px;font-weight:800;border-bottom:2px solid #6366f130;padding-bottom:8px;margin-top:32px;color:#1a1a2e}
      h3{font-size:17px;font-weight:700;margin-top:20px;color:#374151}
      ul{padding-left:24px}li{margin:5px 0}
      mark{padding:2px 5px;border-radius:3px}
      img{max-width:100%;border-radius:8px}
      p{margin:8px 0}
      .header{border-bottom:3px solid #6366f1;padding-bottom:16px;margin-bottom:32px}
      .footer{margin-top:60px;font-size:11px;color:#aaa;border-top:1px solid #eee;padding-top:10px}
    </style></head><body>
    <div class="header">
      <h1 style="color:#6366f1;font-size:28px;margin:0">${activeArea}</h1>
      <p style="color:#888;margin:6px 0 0">Caderno de Erros · ${todayStr()}</p>
    </div>
    ${html}
    <div class="footer">Residência Médica · ${activeArea}</div>
    </body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 400);
  }

  return (
    <div style={{display:'flex',height:'calc(100vh - 52px)',margin:'-26px -28px',overflow:'hidden',fontFamily:"'DM Sans',system-ui,sans-serif"}}>

      {/* LEFT SIDEBAR — Areas */}
      <div style={{width:190,flexShrink:0,borderRight:'1.5px solid #ebebf3',background:'#fafafa',display:'flex',flexDirection:'column',overflowY:'auto'}}>
        <div style={{padding:'16px 12px 8px',borderBottom:'1px solid #f0f0f8'}}>
          <div style={{fontSize:11,fontWeight:800,color:'#aaa',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Caderno de Erros</div>
          {/* Search */}
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="🔍 Buscar..."
            style={{width:'100%',padding:'7px 10px',border:'1.5px solid #e5e5eb',borderRadius:8,fontSize:12,outline:'none',fontFamily:'inherit'}}
          />
        </div>

        {/* Search results */}
        {search && (
          <div style={{padding:'8px 10px',borderBottom:'1px solid #f0f0f8'}}>
            {searchResults.length === 0
              ? <div style={{fontSize:11,color:'#aaa'}}>Nenhum resultado</div>
              : searchResults.map((r,i) => (
                <div key={i} onClick={()=>{setActiveArea(r.area);setSearch('');}} style={{padding:'6px 8px',borderRadius:7,cursor:'pointer',marginBottom:4,background:'#eef2ff'}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#6366f1'}}>{r.area}</div>
                  <div style={{fontSize:11,color:'#555',marginTop:2}}>...{r.context.replace(new RegExp(r.query,'gi'), m=>`<b>${m}</b>`)}...</div>
                </div>
              ))
            }
          </div>
        )}

        {/* Area list */}
        <div style={{flex:1,padding:'8px 10px',display:'flex',flexDirection:'column',gap:3}}>
          {NOTEBOOK_AREAS.map(area => {
            const sections = countSections(area);
            const hasContent = (notebooks[area]||'').replace(/<[^>]*>/g,'').trim().length > 0;
            return (
              <div key={area} onClick={()=>{setActiveArea(area);setSearch('');}}
                style={{padding:'10px 10px',borderRadius:9,cursor:'pointer',
                  background:activeArea===area?AREA_BG[area]:'transparent',
                  border:activeArea===area?`1.5px solid ${AREA_COLOR[area]}30`:'1.5px solid transparent',
                  transition:'all .15s'}}>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  <span style={{fontSize:15}}>{AREA_ICON[area]}</span>
                  <span style={{fontSize:12,fontWeight:activeArea===area?700:500,color:activeArea===area?AREA_COLOR[area]:'#555',lineHeight:1.3}}>{area}</span>
                </div>
                {sections > 0 && (
                  <div style={{fontSize:10,color:'#aaa',marginTop:4,paddingLeft:21}}>
                    {sections} {sections===1?'seção':'seções'}
                    {hasContent && <span style={{color:AREA_COLOR[area],marginLeft:4}}>●</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom actions */}
        <div style={{padding:'10px 12px',borderTop:'1px solid #f0f0f8',display:'flex',flexDirection:'column',gap:6}}>
          <button onClick={()=>setShowReview(true)}
            style={{background:'#fef3c7',color:'#b45309',border:'none',borderRadius:8,padding:'8px',cursor:'pointer',fontWeight:700,fontSize:11,textAlign:'left'}}>
            🔖 Revisões ({allReviewMarks.length})
          </button>
          <button onClick={()=>setShowImport(true)}
            style={{background:'#eef2ff',color:'#6366f1',border:'none',borderRadius:8,padding:'8px',cursor:'pointer',fontWeight:700,fontSize:11,textAlign:'left'}}>
            ✨ Importar com IA
          </button>
          <div style={{fontSize:10,color:saved?'#10b981':'#ccc',textAlign:'center',transition:'color .3s'}}>
            {saved?'✓ Salvo':'● Auto-salvamento'}
          </div>
        </div>
      </div>

      {/* MIDDLE — TOC (Table of Contents) */}
      {toc.length > 0 && (
        <div style={{width:160,flexShrink:0,borderRight:'1.5px solid #ebebf3',background:'#fff',overflowY:'auto',padding:'16px 10px'}}>
          <div style={{fontSize:10,fontWeight:800,color:'#aaa',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Índice</div>
          {toc.map((item,i) => (
            <div key={i} onClick={()=>scrollToAnchor(item.id)}
              style={{padding:`5px ${item.level===1?6:16}px`,cursor:'pointer',borderRadius:6,marginBottom:2,
                fontSize:item.level===1?12:11,
                fontWeight:item.level===1?700:400,
                color:item.level===1?AREA_COLOR[activeArea]:'#555',
                borderLeft:item.level===1?`2px solid ${AREA_COLOR[activeArea]}`:'2px solid transparent',
                transition:'all .1s',lineHeight:1.4}}
              onMouseEnter={e=>e.currentTarget.style.background='#f5f5f8'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              {item.label}
            </div>
          ))}
        </div>
      )}

      {/* RIGHT — Editor / Reader */}
      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0,overflow:'hidden'}}>

        {/* Toolbar */}
        <div style={{background:'#fff',borderBottom:'1.5px solid #ebebf3',padding:'8px 16px',display:'flex',gap:6,alignItems:'center',flexWrap:'wrap',flexShrink:0}}>
          {/* Mode toggle */}
          <div style={{display:'flex',background:'#f5f5f8',borderRadius:8,padding:2,marginRight:8}}>
            <button onClick={()=>setEditMode(false)}
              style={{background:!editMode?'#fff':'transparent',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:!editMode?700:400,color:!editMode?'#6366f1':'#888',transition:'all .15s'}}>
              👁 Leitura
            </button>
            <button onClick={()=>setEditMode(true)}
              style={{background:editMode?'#fff':'transparent',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:editMode?700:400,color:editMode?'#6366f1':'#888',transition:'all .15s'}}>
              ✏️ Edição
            </button>
          </div>

          {editMode && (<>
            {/* Heading buttons */}
            <button onMouseDown={e=>{e.preventDefault();insertHeading(1);}}
              style={{background:'#eef2ff',border:'none',borderRadius:6,padding:'5px 10px',cursor:'pointer',fontSize:12,fontWeight:800,color:'#6366f1'}}>T Título</button>
            <button onMouseDown={e=>{e.preventDefault();insertHeading(2);}}
              style={{background:'#f5f5fb',border:'none',borderRadius:6,padding:'5px 10px',cursor:'pointer',fontSize:12,fontWeight:700,color:'#555'}}>t Subtítulo</button>
            <div style={{width:1,height:20,background:'#e5e5eb',margin:'0 2px'}}/>
            {[['B','bold','fontWeight:800'],['I','italic','fontStyle:italic'],['U','underline','textDecoration:underline']].map(([l,c,s])=>(
              <button key={c} onMouseDown={e=>{e.preventDefault();execCmd(c);}}
                style={{background:'#fff',border:'1.5px solid #e5e5eb',borderRadius:6,padding:'4px 9px',cursor:'pointer',fontSize:12,fontFamily:'inherit',color:'#333'}}>
                <span style={{[s.split(':')[0]]:s.split(':')[1]}}>{l}</span>
              </button>
            ))}
            <div style={{width:1,height:20,background:'#e5e5eb',margin:'0 2px'}}/>
            {/* Highlight */}
            <div style={{position:'relative'}}>
              <button onMouseDown={e=>{e.preventDefault();setShowHL(v=>!v);}}
                style={{background:'#fef08a',border:'1.5px solid #e5e5eb',borderRadius:6,padding:'4px 9px',cursor:'pointer',fontSize:12,fontWeight:700}}>
                🖊 Grifar
              </button>
              {showHL && (
                <div style={{position:'absolute',top:34,left:0,background:'#fff',borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,.15)',padding:8,display:'flex',gap:6,zIndex:50}}>
                  {HIGHLIGHT_COLORS.map(c=>(
                    <button key={c} onMouseDown={e=>{e.preventDefault();insertHighlight(c);}}
                      style={{width:22,height:22,borderRadius:5,background:c,border:'1.5px solid #e5e5eb',cursor:'pointer'}}/>
                  ))}
                  <button onMouseDown={e=>{e.preventDefault();execCmd('removeFormat');setShowHL(false);}}
                    style={{width:22,height:22,borderRadius:5,background:'#f5f5f5',border:'1.5px solid #e5e5eb',cursor:'pointer',fontSize:10,fontWeight:700,color:'#888'}}>✕</button>
                </div>
              )}
            </div>
            <button onMouseDown={e=>{e.preventDefault();insertReviewMark();}}
              style={{background:'#fef3c7',border:'1.5px solid #e5e5eb',borderRadius:6,padding:'4px 9px',cursor:'pointer',fontSize:12,fontWeight:700,color:'#b45309'}}>
              🔖 Revisar
            </button>
            <button onMouseDown={e=>{e.preventDefault();execCmd('insertUnorderedList');}}
              style={{background:'#fff',border:'1.5px solid #e5e5eb',borderRadius:6,padding:'4px 9px',cursor:'pointer',fontSize:12}}>• Lista</button>
          </>)}

          <div style={{marginLeft:'auto',display:'flex',gap:6}}>
            <button onClick={exportPDF}
              style={{background:'#f5f5fb',border:'none',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontSize:11,fontWeight:600,color:'#6366f1'}}>
              📄 PDF
            </button>
          </div>
        </div>

        {/* Area header */}
        <div style={{padding:'12px 20px 0',background:'#fff',borderBottom:'1px solid #f5f5f8',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:22}}>{AREA_ICON[activeArea]}</span>
            <span style={{fontSize:18,fontWeight:800,fontFamily:"'DM Serif Display',serif",color:AREA_COLOR[activeArea]}}>{activeArea}</span>
          </div>
          {!editMode && <p style={{fontSize:11,color:'#aaa',marginTop:4,marginBottom:8,marginLeft:30}}>Clique nos itens do índice para navegar · Alterne para Edição para escrever</p>}
          {editMode && <p style={{fontSize:11,color:'#aaa',marginTop:4,marginBottom:8,marginLeft:30}}>Selecione texto → clique em "Título" ou "Subtítulo" para criar âncoras navegáveis</p>}
        </div>

        {/* Content area */}
        <div id="notebook-content" style={{flex:1,overflowY:'auto',padding:'20px 28px'}}>
          {editMode ? (
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              style={{minHeight:'100%',outline:'none',fontSize:14,lineHeight:1.85,color:'#1a1a2e',fontFamily:"'DM Sans',system-ui,sans-serif"}}
            />
          ) : (
            <div
              style={{fontSize:14,lineHeight:1.85,color:'#1a1a2e',fontFamily:"'DM Sans',system-ui,sans-serif"}}
              dangerouslySetInnerHTML={{__html: notebooks[activeArea] || '<p style="color:#ccc;text-align:center;padding:40px 0">Este caderno está vazio. Alterne para modo Edição para começar a escrever!</p>'}}
            />
          )}
        </div>
      </div>

      {/* REVIEW PANEL */}
      {showReview && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#fff',borderRadius:18,padding:24,width:'100%',maxWidth:560,maxHeight:'80vh',overflow:'hidden',display:'flex',flexDirection:'column'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h2 style={{fontSize:18,fontWeight:700}}>🔖 Trechos para Revisar</h2>
              <button onClick={()=>setShowReview(false)} style={{background:'#f5f5f8',border:'none',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontWeight:700}}>✕</button>
            </div>
            <div style={{overflowY:'auto',flex:1,display:'flex',flexDirection:'column',gap:10}}>
              {allReviewMarks.length === 0
                ? <div style={{color:'#aaa',textAlign:'center',padding:'30px 0'}}>Nenhum trecho marcado para revisão ainda.<br/><span style={{fontSize:12}}>Use o botão 🔖 no editor para marcar trechos importantes.</span></div>
                : allReviewMarks.map((m,i) => (
                  <div key={i} style={{background:'#fffbeb',borderRadius:10,padding:'12px 14px',borderLeft:'3px solid #f59e0b'}}>
                    <div style={{fontSize:11,fontWeight:700,color:AREA_COLOR[m.area],marginBottom:4}}>{m.area}</div>
                    <div style={{fontSize:13,color:'#1a1a2e'}}>{m.text.replace('🔖','').trim()}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImport && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#fff',borderRadius:18,padding:24,width:'100%',maxWidth:560,maxHeight:'90vh',overflow:'hidden',display:'flex',flexDirection:'column'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h2 style={{fontSize:18,fontWeight:700}}>✨ Importar com IA</h2>
              <button onClick={()=>{setShowImport(false);setImportResult(null);setImportText('');}} style={{background:'#f5f5f8',border:'none',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontWeight:700}}>✕</button>
            </div>
            <p style={{fontSize:13,color:'#888',marginBottom:14}}>Cole qualquer anotação médica. A IA identifica automaticamente a área e o subtema correto.</p>
            <textarea
              value={importText}
              onChange={e=>setImportText(e.target.value)}
              placeholder="Cole sua anotação aqui..."
              style={{width:'100%',minHeight:180,padding:'12px 14px',border:'1.5px solid #e5e5eb',borderRadius:10,fontSize:13,fontFamily:'inherit',outline:'none',resize:'vertical',marginBottom:12}}
            />
            {!importResult && (
              <button onClick={handleImport} disabled={importing||!importText.trim()}
                style={{background:importing?'#e5e5eb':'#6366f1',color:'#fff',border:'none',borderRadius:10,padding:'12px',cursor:importing?'default':'pointer',fontWeight:700,fontSize:14}}>
                {importing ? '✨ Analisando...' : '✨ Analisar com IA'}
              </button>
            )}
            {importResult && (
              <div style={{background:'#f0fdf4',borderRadius:12,padding:16,border:'1.5px solid #bbf7d0',marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:'#16a34a',marginBottom:8}}>✅ IA identificou:</div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {[['Grande Área',importResult.area],['Subtema',importResult.subtema],['Título',importResult.titulo]].map(([k,v])=>(
                    <div key={k} style={{display:'flex',gap:8,alignItems:'center'}}>
                      <span style={{fontSize:11,color:'#888',width:80,flexShrink:0}}>{k}</span>
                      <span style={{fontSize:13,fontWeight:600,color:'#1a1a2e'}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:8,marginTop:12}}>
                  <button onClick={confirmImport} style={{flex:1,background:'#6366f1',color:'#fff',border:'none',borderRadius:10,padding:'10px',cursor:'pointer',fontWeight:700,fontSize:13}}>✅ Inserir no caderno</button>
                  <button onClick={()=>setImportResult(null)} style={{flex:1,background:'#f5f5fb',color:'#555',border:'none',borderRadius:10,padding:'10px',cursor:'pointer',fontWeight:600,fontSize:13}}>🔄 Analisar de novo</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        [contenteditable] h2{font-size:20px;font-weight:800;margin:20px 0 8px;color:#1a1a2e;padding-bottom:6px;border-bottom:2px solid #6366f120}
        [contenteditable] h3{font-size:16px;font-weight:700;margin:16px 0 6px;color:#374151}
        [contenteditable] ul{padding-left:22px;margin:8px 0}
        [contenteditable] ol{padding-left:22px;margin:8px 0}
        [contenteditable] li{margin:5px 0;line-height:1.7}
        [contenteditable] ul ul{list-style-type:circle;margin:4px 0}
        [contenteditable] ul ul ul{list-style-type:square}
        [contenteditable] p{margin:6px 0}
        [contenteditable] img{max-width:100%;border-radius:8px}
        [contenteditable]:empty:before{content:"Comece a escrever... Selecione texto e clique em Título ou Subtítulo para criar seções navegáveis.";color:#ccc}
        #notebook-content h2{font-size:20px;font-weight:800;margin:20px 0 8px;color:#1a1a2e;padding-bottom:6px;border-bottom:2px solid #6366f120}
        #notebook-content h3{font-size:16px;font-weight:700;margin:16px 0 6px;color:#374151}
        #notebook-content ul{padding-left:22px;margin:8px 0}
        #notebook-content li{margin:5px 0;line-height:1.7}
        #notebook-content ul ul{list-style-type:circle;margin:4px 0}
        #notebook-content ul ul ul{list-style-type:square}
        #notebook-content p{margin:6px 0}
        #notebook-content img{max-width:100%;border-radius:8px}
        #notebook-content strong{font-weight:800}
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// EXAMS PAGE
// ─────────────────────────────────────────────
function ExamsPage({exams,setExams}){
  const [showForm,setShowForm]=useState(false);
  const [filterType,setFilterType]=useState("Todas");
  const [sel,setSel]=useState(null);
  const empty={type:"Prova Real",name:"",year:String(new Date().getFullYear()),date:new Date().toISOString().slice(0,10),totalQ:"",correctQ:"",areas:Object.fromEntries(GRANDES_AREAS.map(a=>[a,{total:"",correct:""}])),notes:""};
  const [form,setForm]=useState(empty);
  const filtered=exams.filter(e=>filterType==="Todas"||e.type===filterType).sort((a,b)=>new Date(a.date)-new Date(b.date));
  function save(){
    if(!form.name||!form.totalQ||!form.correctQ) return;
    const acc=Math.round((parseInt(form.correctQ)/parseInt(form.totalQ))*100);
    const areaStats={};
    GRANDES_AREAS.forEach(a=>{const v=form.areas[a];if(v.total&&v.correct) areaStats[a]={total:parseInt(v.total),correct:parseInt(v.correct),accuracy:Math.round(parseInt(v.correct)/parseInt(v.total)*100)};});
    setExams(p=>[...p,{...form,id:`ex-${Date.now()}`,accuracy:acc,totalQ:parseInt(form.totalQ),correctQ:parseInt(form.correctQ),areaStats}]);
    setForm(empty); setShowForm(false);
  }
  function del(id){ setExams(p=>p.filter(e=>e.id!==id)); if(sel?.id===id) setSel(null); }
  const reals=exams.filter(e=>e.type==="Prova Real").sort((a,b)=>new Date(a.date)-new Date(b.date));
  const sims=exams.filter(e=>e.type==="Simulado").sort((a,b)=>new Date(a.date)-new Date(b.date));
  const avgAcc=filtered.length?Math.round(filtered.reduce((s,e)=>s+e.accuracy,0)/filtered.length):0;
  const best=[...filtered].sort((a,b)=>b.accuracy-a.accuracy)[0];
  const last=[...filtered].sort((a,b)=>new Date(b.date)-new Date(a.date))[0];

  function MiniBar({data,color}){
    if(!data||data.length<1) return <div style={{color:"#aaa",fontSize:12}}>Sem dados</div>;
    const max=Math.max(...data.map(d=>d.accuracy),1);
    return(
      <div style={{display:"flex",alignItems:"flex-end",gap:3,height:44}}>
        {data.map((d,i)=>(
          <div key={i} title={`${d.name||d.date}: ${d.accuracy}%`} style={{flex:1,height:`${Math.max(8,(d.accuracy/100)*40)}px`,background:color,borderRadius:"3px 3px 0 0",opacity:.6+i/data.length*.4,minWidth:8,cursor:"default"}}/>
        ))}
      </div>
    );
  }

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><h1 style={{fontSize:22,fontFamily:"'DM Serif Display',serif"}}>🏆 Provas na Íntegra</h1>
        <p style={{fontSize:12,color:"#888",marginTop:3}}>Provas reais e simulados — acompanhe sua evolução</p></div>
        <button className="btn btn-primary" onClick={()=>setShowForm(true)}>+ Registrar prova</button>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {["Todas","Prova Real","Simulado"].map(t=>(
          <button key={t} className="btn btn-sm" style={{background:filterType===t?"#6366f1":"#f5f5fb",color:filterType===t?"#fff":"#555",border:"none",cursor:"pointer"}} onClick={()=>setFilterType(t)}>
            {t==="Prova Real"?"🏥 Real":t==="Simulado"?"📝 Simulado":"Todas"}
          </button>
        ))}
      </div>
      {!exams.length?(
        <div className="card" style={{padding:48,textAlign:"center",color:"#aaa"}}>
          <div style={{fontSize:48,marginBottom:14}}>🏆</div>
          <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>Nenhuma prova registrada ainda</div>
          <div style={{fontSize:13}}>Registre sua primeira prova para acompanhar sua evolução!</div>
        </div>
      ):(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
            {[
              {label:"Provas registradas",val:filtered.length,icon:"📋",color:"#6366f1"},
              {label:"Acerto médio",val:avgAcc?`${avgAcc}%`:"—",icon:"🎯",color:avgAcc>=70?"#10b981":avgAcc>=50?"#f59e0b":"#dc2626"},
              {label:"Melhor resultado",val:best?`${best.accuracy}%`:"—",icon:"🏅",color:"#10b981"},
              {label:"Última prova",val:last?fmt(last.date):"—",icon:"📅",color:"#888"},
            ].map(s=>(
              <div key={s.label} className="card" style={{padding:16}}>
                <div style={{fontSize:20,marginBottom:6}}>{s.icon}</div>
                <div style={{fontSize:20,fontWeight:800,color:s.color}}>{s.val}</div>
                <div style={{fontSize:11,color:"#888"}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
            {[{label:"Provas Reais",data:reals,color:"#6366f1"},{label:"Simulados",data:sims,color:"#10b981"}].map(({label,data,color})=>(
              <div key={label} className="card" style={{padding:18}}>
                <div style={{fontWeight:700,marginBottom:10}}>📈 {label}</div>
                <MiniBar data={data} color={color}/>
                {data.length>=2&&<div style={{fontSize:11,color:data[data.length-1].accuracy>data[0].accuracy?"#10b981":"#dc2626",marginTop:6}}>
                  {data[data.length-1].accuracy>data[0].accuracy?"↑":"↓"} {Math.abs(data[data.length-1].accuracy-data[0].accuracy)}pp desde a primeira prova
                </div>}
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:sel?"300px 1fr":"1fr",gap:14}}>
            <div style={{display:"flex",flexDirection:"column",gap:10,maxHeight:"60vh",overflowY:"auto"}}>
              {filtered.map(e=>(
                <div key={e.id} className="mod-card" style={{border:sel?.id===e.id?"2px solid #6366f1":"1.5px solid #ebebf3"}} onClick={()=>setSel(e)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20,background:e.type==="Prova Real"?"#eef2ff":"#ecfdf5",color:e.type==="Prova Real"?"#6366f1":"#10b981"}}>{e.type==="Prova Real"?"🏥 Real":"📝 Simulado"}</span>
                      <div style={{fontSize:14,fontWeight:700,marginTop:5}}>{e.name} {e.year}</div>
                      <div style={{fontSize:11,color:"#888",marginTop:2}}>{fmt(e.date)} · {e.totalQ} questões</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:22,fontWeight:800,color:e.accuracy>=70?"#10b981":e.accuracy>=50?"#f59e0b":"#dc2626"}}>{e.accuracy}%</div>
                      <div style={{fontSize:11,color:"#888"}}>{e.correctQ}/{e.totalQ}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {sel&&(
              <div className="card" style={{padding:22}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
                  <div>
                    <h2 style={{fontSize:18,fontWeight:700}}>{sel.name} {sel.year}</h2>
                    <p style={{fontSize:12,color:"#888"}}>{fmt(sel.date)} · {sel.type}</p>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn btn-sm" style={{background:"#fef2f2",color:"#dc2626",border:"none"}} onClick={()=>del(sel.id)}>Excluir</button>
                    <button className="btn btn-sm" style={{background:"#f0f0f8",border:"none",cursor:"pointer"}} onClick={()=>setSel(null)}>✕</button>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
                  {[{label:"Acerto geral",val:`${sel.accuracy}%`,color:sel.accuracy>=70?"#10b981":sel.accuracy>=50?"#f59e0b":"#dc2626"},{label:"Acertos",val:sel.correctQ,color:"#6366f1"},{label:"Erros",val:sel.totalQ-sel.correctQ,color:"#dc2626"}].map(s=>(
                    <div key={s.label} style={{background:"#f8f8fb",borderRadius:10,padding:12,textAlign:"center"}}>
                      <div style={{fontSize:24,fontWeight:800,color:s.color}}>{s.val}</div>
                      <div style={{fontSize:11,color:"#888"}}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {Object.keys(sel.areaStats||{}).length>0&&(
                  <div>
                    <div style={{fontWeight:700,marginBottom:10}}>Por área</div>
                    {Object.entries(sel.areaStats).map(([a,v])=>(
                      <div key={a} style={{marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:12,fontWeight:600,color:AREA_COLOR[a]}}>{a}</span>
                          <span style={{fontSize:12,fontWeight:700,color:v.accuracy>=70?"#10b981":v.accuracy>=50?"#f59e0b":"#dc2626"}}>{v.accuracy}% ({v.correct}/{v.total})</span>
                        </div>
                        <div className="pbar"><div className="pfill" style={{width:`${v.accuracy}%`,background:AREA_COLOR[a]}}/></div>
                      </div>
                    ))}
                  </div>
                )}
                {sel.notes&&<div style={{marginTop:14,background:"#f8f8fb",borderRadius:10,padding:12}}><div style={{fontSize:11,fontWeight:600,color:"#888",marginBottom:4}}>Anotações</div><div style={{fontSize:13}}>{sel.notes}</div></div>}
              </div>
            )}
          </div>
        </>
      )}
      {showForm&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div className="modal" style={{maxWidth:560}}>
            <h2 style={{fontSize:17,fontWeight:700,marginBottom:18}}>Registrar prova</h2>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {["Prova Real","Simulado"].map(t=>(
                <button key={t} className="btn btn-sm" style={{flex:1,background:form.type===t?"#6366f1":"#f5f5fb",color:form.type===t?"#fff":"#555",border:"none",cursor:"pointer",padding:10}} onClick={()=>setForm(p=>({...p,type:t}))}>
                  {t==="Prova Real"?"🏥 Prova Real":"📝 Simulado"}
                </button>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10}}>
                <div><label style={{fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>Banca / nome</label><input className="input" placeholder="Ex: USP, Revalida..." value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
                <div><label style={{fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>Ano</label><input className="input" type="number" value={form.year} onChange={e=>setForm(p=>({...p,year:e.target.value}))}/></div>
              </div>
              <div><label style={{fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>Data que realizou</label><input className="input" type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label style={{fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>Total de questões</label><input className="input" type="number" placeholder="Ex: 120" value={form.totalQ} onChange={e=>setForm(p=>({...p,totalQ:e.target.value}))}/></div>
                <div><label style={{fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>Questões corretas</label><input className="input" type="number" placeholder="Ex: 84" value={form.correctQ} onChange={e=>setForm(p=>({...p,correctQ:e.target.value}))}/></div>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:700,display:"block",marginBottom:8}}>Por área (opcional)</label>
                {GRANDES_AREAS.map(a=>(
                  <div key={a} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                    <span style={{fontSize:11,fontWeight:600,color:AREA_COLOR[a],width:180,flexShrink:0}}>{a}</span>
                    <input className="input" type="number" placeholder="Total" style={{width:65}} value={form.areas[a].total} onChange={e=>setForm(p=>({...p,areas:{...p.areas,[a]:{...p.areas[a],total:e.target.value}}}))}/>
                    <input className="input" type="number" placeholder="Certas" style={{width:65}} value={form.areas[a].correct} onChange={e=>setForm(p=>({...p,areas:{...p.areas,[a]:{...p.areas[a],correct:e.target.value}}}))}/>
                    <span style={{fontSize:11,color:"#888",width:36}}>{form.areas[a].total&&form.areas[a].correct?`${Math.round(parseInt(form.areas[a].correct)/parseInt(form.areas[a].total)*100)}%`:""}</span>
                  </div>
                ))}
              </div>
              <div><label style={{fontSize:12,fontWeight:600,display:"block",marginBottom:5}}>Anotações</label><textarea className="input" placeholder="Como foi? O que melhorar?" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={{minHeight:70}}/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18}}>
              <button className="btn btn-primary" style={{flex:1}} onClick={save}>Salvar prova</button>
              <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
