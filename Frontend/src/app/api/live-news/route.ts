import { NextResponse } from "next/server";

export async function GET() {
  const news = [
    {
      id: "NEWS-1",
      title: "Finance Ministry Mandates Blockchain Security Audits for Procurement Portals Above ₹100 Crore",
      source: "Press Information Bureau (PIB)",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hrs ago
      category: "Reform",
      url: "#"
    },
    {
      id: "NEWS-2",
      title: "Decentralized IPFS Storage for Technical Specifications Integrates with GeM & TenderChain",
      source: "MeitY News",
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), // 8 hrs ago
      category: "Blockchain",
      url: "#"
    },
    {
      id: "NEWS-3",
      title: "Indian Railways Announces ₹5,000 Crore Station Modernization Plan under Net-Zero Solar Initiative",
      source: "Ministry of Railways",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      category: "Ministry",
      url: "#"
    },
    {
      id: "NEWS-4",
      title: "TenderChain Surpasses 2.4 Million Tamper-Proof Procurement Contracts Deployed On-chain",
      source: "TechGov India",
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      category: "Announcement",
      url: "#"
    }
  ];

  return NextResponse.json(news);
}
