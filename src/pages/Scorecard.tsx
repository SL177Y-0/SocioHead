          <div className="border rounded-lg bg-panel p-4 mb-5">
            <div className="text-white/50 text-sm mb-1">Telegram</div>
            <SlotMachineScore value={scoreData.telegramScore} className="text-xl text-white" digits={3} />
            <div className="h-2 bg-dark-800 mt-3 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#E95AE9] to-[#E967AD]"
                initial={{ width: 0 }}
                animate={{ width: calculateProgressBarWidth(scoreData.telegramScore, MAX_SCORES.TELEGRAM) }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>
          </div> 