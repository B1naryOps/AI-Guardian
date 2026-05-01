import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Department {
  name: string;
  avgVigilance: number;
  points: number;
  staffCount: number;
}

interface ReportExportButtonProps {
  departments: Department[];
  globalVigilance: number;
}

export const ReportExportButton: React.FC<ReportExportButtonProps> = ({ departments, globalVigilance }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Pour éviter de bloquer l'UI, on simule un court délai
      await new Promise(resolve => setTimeout(resolve, 800));

      const doc = new jsPDF();
      const currentMonth = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      
      // En-tête
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text("AI-GUARDIAN", 14, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Rapport de Cybersécurité - ${currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}`, 14, 32);

      // Section 1: Résumé
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text("1. Synthèse Globale", 14, 55);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Indice de Vigilance Global : ${globalVigilance.toFixed(1)}%`, 14, 65);
      doc.text(`Nombre de départements : ${departments.length}`, 14, 72);
      
      // Section 2: Tableau des Départements (Top / Flop)
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text("2. Classement des Départements", 14, 90);

      const sortedDepts = [...departments].sort((a, b) => b.points - a.points);
      
      const tableData = sortedDepts.map((d, index) => [
        `${index + 1}`,
        d.name,
        `${d.avgVigilance.toFixed(1)}%`,
        `${d.points} pts`,
        `${d.staffCount}`
      ]);

      autoTable(doc, {
        startY: 95,
        head: [['Rang', 'Département', 'Vigilance Moy.', 'Score', 'Effectif']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // brand-600
        styles: { font: 'helvetica' }
      });

      // Section 3: Recommandations IA
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text("3. Recommandations Stratégiques de l'IA", 14, finalY + 15);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const lowestDept = sortedDepts.length > 0 ? sortedDepts[sortedDepts.length - 1] : null;
      let recommendation = "Félicitations, la posture de sécurité globale est excellente. Poursuivez les campagnes d'entraînement régulières pour maintenir ce niveau.";
      
      if (lowestDept && lowestDept.avgVigilance < 75) {
        recommendation = `ALERTE : Le département '${lowestDept.name}' présente une vulnérabilité élevée (Vigilance à ${lowestDept.avgVigilance.toFixed(1)}%). L'IA recommande l'organisation immédiate d'un atelier ciblé sur le "Smishing" et le signalement d'incidents.`;
      } else if (globalVigilance < 85) {
        recommendation = "La vigilance globale est moyenne. L'IA recommande d'intensifier la fréquence des simulations multi-vecteurs (SMS/Email) ce mois-ci pour réveiller l'attention des collaborateurs.";
      }

      // Gestion du texte long
      const splitText = doc.splitTextToSize(recommendation, 180);
      doc.text(splitText, 14, finalY + 25);

      // Pied de page
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("Généré automatiquement par AI-Guardian", 105, 290, { align: "center" });

      // Téléchargement
      doc.save(`Rapport_Comex_${currentMonth.replace(' ', '_')}.pdf`);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-xl font-bold transition-all disabled:opacity-50 border border-indigo-200 dark:border-indigo-800"
    >
      {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
      <span className="hidden sm:inline">{isGenerating ? "Génération..." : "Rapport Comex"}</span>
    </button>
  );
};
