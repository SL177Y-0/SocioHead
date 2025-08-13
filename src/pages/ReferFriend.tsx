"use client"

import { useState } from "react"
import { Copy, Check, Users, X, Twitter, Send, MessageCircle, Mail, Sparkles, Gift } from "lucide-react"
import PageTransition from '@/components/PageTransition';

export default function ReferFriend() {
  const [showReferralModal, setShowReferralModal] = useState(false)
  const [copyStatus, setCopyStatus] = useState("")
  const referralLink = "https://defi.cluster.ai/ref/BRUTALG21614093"

  // Copy the referral link to clipboard
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopyStatus("copied")
    setTimeout(() => setCopyStatus(""), 2000)
  }

  return (
    <PageTransition>
      <div className="relative">
        {/* Refer Button with Glow Effect */}
        <button
          className="px-5 py-2 bg-[#071219] text-[#33FFB8] rounded-xl flex items-center gap-2 text-sm font-semibold border border-[#33FFB8]/30 hover:bg-[#0A1A22] transition-colors"
          onClick={() => setShowReferralModal(true)}
        >
          <Users className="h-4 w-4" />
          Refer a Friend
        </button>

        {/* Referral Modal */}
        {showReferralModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-[#071219] border border-[#33FFB8]/30 rounded-xl p-6 max-w-2xl w-full relative">
              <button onClick={() => setShowReferralModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white">Refer & Earn Rewards</h3>
                <p className="text-gray-400 mt-2">Invite your friends and earn exciting rewards!</p>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Left: Benefits */}
                <div>
                  <div className="bg-[#0F1B24]/80 rounded-xl p-5 border border-[#1E2A32]">
                    <div className="flex items-center justify-center mb-4">
                      <Gift className="h-10 w-10 text-[#33FFB8]" />
                    </div>
                    <h4 className="text-lg font-bold text-center mb-3 text-white">Earn Exclusive Rewards</h4>
                    <ul className="text-white/70 text-sm space-y-2">
                      <li className="flex items-start">
                        <span className="mr-2">🎉</span>
                        <span>50 points per successful referral</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">🎁</span>
                        <span>Bonus 100 points when they connect their wallet</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">🏅</span>
                        <span>Unlock the "Network Builder" badge after 5 referrals</span>
                      </li>
                    </ul>
                  </div>

                  {/* Referral Stats */}
                  <div className="mt-5 bg-[#0F1B24]/80 rounded-xl p-4 border border-[#1E2A32]">
                    <h5 className="text-base font-bold text-white mb-3">Your Referral Stats</h5>
                    <div className="flex justify-around">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#33FFB8]">3</div>
                        <p className="text-white/70 text-xs">Friends Referred</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#33FFB8]">150</div>
                        <p className="text-white/70 text-xs">Points Earned</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Share Link & Buttons */}
                <div className="flex flex-col">
                  <div className="bg-[#0F1B24]/80 rounded-xl p-5 border border-[#1E2A32] h-full">
                    <h4 className="text-base font-semibold text-white mb-3">Your Referral Link</h4>
                    <div className="flex items-center bg-[#071219] rounded-lg border border-[#1E2A32] p-2">
                      <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="bg-transparent border-none outline-none flex-1 text-sm text-white/70"
                      />
                      <button
                        className="ml-2 p-1.5 rounded-lg bg-[#071219] hover:bg-[#0A1A22] border border-[#33FFB8]/30 transition-colors"
                        onClick={copyReferralLink}
                      >
                        {copyStatus === "copied" ? (
                          <Check className="h-4 w-4 text-[#33FFB8]" />
                        ) : (
                          <Copy className="h-4 w-4 text-[#33FFB8]" />
                        )}
                      </button>
                    </div>

                    {/* Social Share Buttons */}
                    <h4 className="text-base font-semibold text-white mt-4 mb-3">Share with Friends</h4>
                    <div className="grid grid-cols-4 gap-3">
                      <a
                        href={`https://twitter.com/intent/tweet?text=Check out my DeFi score! Use my referral link: ${referralLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-2 bg-[#071219] rounded-lg border border-[#1E2A32] hover:bg-[#0A1A22] transition-colors"
                      >
                        <Twitter className="h-5 w-5 text-[#33FFB8]" />
                        <span className="text-xs text-white/70 mt-1">Twitter</span>
                      </a>
                      <a
                        href={`https://t.me/share/url?url=${referralLink}&text=Check out my DeFi score!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-2 bg-[#071219] rounded-lg border border-[#1E2A32] hover:bg-[#0A1A22] transition-colors"
                      >
                        <Send className="h-5 w-5 text-[#33FFB8]" />
                        <span className="text-xs text-white/70 mt-1">Telegram</span>
                      </a>
                      <a
                        href={`https://api.whatsapp.com/send?text=Check out my DeFi score! Use my referral link: ${referralLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-2 bg-[#071219] rounded-lg border border-[#1E2A32] hover:bg-[#0A1A22] transition-colors"
                      >
                        <MessageCircle className="h-5 w-5 text-[#33FFB8]" />
                        <span className="text-xs text-white/70 mt-1">WhatsApp</span>
                      </a>
                      <a
                        href={`mailto:?subject=Check out my DeFi score&body=Check out my DeFi score! Use my referral link: ${referralLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-2 bg-[#071219] rounded-lg border border-[#1E2A32] hover:bg-[#0A1A22] transition-colors"
                      >
                        <Mail className="h-5 w-5 text-[#33FFB8]" />
                        <span className="text-xs text-white/70 mt-1">Email</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowReferralModal(false)}
                  className="px-5 py-2 bg-[#071219] text-[#33FFB8] rounded-xl font-medium border border-[#33FFB8]/30 hover:bg-[#0A1A22] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
